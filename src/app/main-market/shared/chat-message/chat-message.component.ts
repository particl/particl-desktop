import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';;
import { FormControl, Validators } from '@angular/forms';
import { Observable, Subject, of, merge, iif, defer } from 'rxjs';
import { tap, takeUntil, catchError, concatMap, finalize, map, filter } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { MarketUserActions } from '../../store/market.actions';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { getValueOrDefault, isBasicObjectType } from '../utils';
import { ChatChannelType } from '../../services/chats/chats.models';
import { RespChatChannelMessages, ChatRequestErrorReason, RespChatMessagePost } from './../market.models';



enum TextContent {
  LOAD_MSGS_ERROR = 'Failed to load messages',
  LOAD_MSGS_MORE_ERROR = 'Failed loading more messages',
  LOAD_MSGS_UNREAD_ERROR = 'Error while loading incoming unread messages',
  SEND_MSG_ERROR_GENERIC = 'Failed to send chat message',
  SEND_MSG_ERROR_SMSG = 'Sending the chat via smsg failed',
  SEND_MSG_ERROR_SIZE = 'Chat message is too large',
  SEND_MSG_ERROR_SIGNING = 'Chat message could not be signed correctly',
}


interface ChatMessage {
  id: string;
  created: number;
  sender: string;
  message: string;
  isOwn: boolean;
  isHighlited: boolean;
  highlitedLabel?: string;
}


@Component({
  selector: 'market-chat',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageComponent implements OnInit, OnDestroy {

  @Input() inputChannel: string = '';
  @Input() inputChannelType: ChatChannelType = ChatChannelType.OTHER;
  @Input() highlitedAddress: string = '';
  @Input() highlitedAddressLabel: string = '';

  @ViewChild('chatHistoryPane', {static: true}) chatHistoryPane: ElementRef;

  readonly MAX_MESSAGE_LENGTH: number = 500;

  messageList: ChatMessage[] = [];
  hasMoreMessages: boolean = false;
  isLoading: boolean = false;
  textInput: FormControl = new FormControl('', [Validators.minLength(1), Validators.maxLength(this.MAX_MESSAGE_LENGTH), Validators.required]);


  private destroy$: Subject<void> = new Subject();
  private readonly MESSAGE_COUNT: number = 30;
  private earliestMessageId: string = '';


  constructor(
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _rpc: MarketRpcService,
    private _snackbar: SnackbarService,
    private _unlocker: WalletEncryptionService,
  ) { }


  ngOnInit() {
    if (
      !(getValueOrDefault(this.inputChannel, 'string', '').length > 0)
      || this.inputChannelType === ChatChannelType.OTHER
    ) {
      return;
    }

    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      map(id => id.id),
      tap(() => {
        this.messageList = [];
        this.isLoading = true;
        this.earliestMessageId = '';
        this._cdr.detectChanges();
      }),

      concatMap(identityId => iif(
        () => identityId > 0,

        defer(() => this.loadChatMessages(identityId, this.MESSAGE_COUNT).pipe(
          tap(() => this._store.dispatch(new MarketUserActions.ChatChannelRead(this.inputChannel, this.inputChannelType))),
          catchError(err => {
            this._snackbar.open(TextContent.LOAD_MSGS_ERROR, 'warn');
            return of([] as ChatMessage[])
          })
        )),

        defer(() => of([] as ChatMessage[]))

      )),
      tap(chatMessages => {
        this.isLoading = false;
        this.hasMoreMessages = chatMessages.length === this.MESSAGE_COUNT;

        if (chatMessages.length > 0) {
          this.messageList = chatMessages;
          this.earliestMessageId = chatMessages[0].id;
        }

        this._cdr.detectChanges();

        this.chatHistoryPane.nativeElement.scrollTop = this.chatHistoryPane.nativeElement.scrollHeight;
      }),
      takeUntil(this.destroy$)
    );

    const newUnreads$ = this._store.select(MarketState.unreadChatChannels(this.inputChannelType)).pipe(
      filter((chats) => chats.findIndex(c => c === this.inputChannel) > -1),
      concatMap(() => this.loadChatMessages(
        this._store.selectSnapshot(MarketState.currentIdentity).id,
        this.MESSAGE_COUNT,
      )),
      catchError(err => {
        this._snackbar.open(TextContent.LOAD_MSGS_UNREAD_ERROR, 'warn');
        return of([] as ChatMessage[])
      }),
      map(messages => {
        return messages.filter(msg => this.messageList.findIndex(m => m.id === msg.id) === -1);
      }),
      tap(messages => {
        if (messages.length === 0) {
          return;
        }
        if (messages.length === this.MESSAGE_COUNT) {
          this.messageList = [];
          this.earliestMessageId = messages[0].id;
        }
        this.messageList.push(...messages);
        this._store.dispatch(new MarketUserActions.ChatChannelRead(this.inputChannel, this.inputChannelType));
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );


    merge(
      identityChange$,
      newUnreads$
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();

  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByMessageFn(idx: number, item: ChatMessage) {
    return item.id;
  }


  requestMessageSending() {
    if (this.textInput.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this._cdr.detectChanges();

    this._unlocker.unlock({timeout: 10}).pipe(
      concatMap((unlocked) => iif(
        () => unlocked,
        defer(() => this.sendMessage())
      )),
      finalize(() => {
        this.isLoading = false;

        if (this.chatHistoryPane.nativeElement.scrollTop > (this.chatHistoryPane.nativeElement.scrollHeight - 10)) {
          this.chatHistoryPane.nativeElement.scrollTop = this.chatHistoryPane.nativeElement.scrollHeight;
        }
        this._cdr.detectChanges();
      })
    ).subscribe();
  }


  loadMoreHistory() {
    if (!this.hasMoreMessages || this.isLoading || !this.earliestMessageId) {
      return;
    }

    this.isLoading = true;
    this._cdr.detectChanges();

    this.loadChatMessages(
      this._store.selectSnapshot(MarketState.currentIdentity).id,
      this.MESSAGE_COUNT,
      this.earliestMessageId
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this._cdr.detectChanges();
      }),
      tap(messages => {
        this.hasMoreMessages = messages.length === this.MESSAGE_COUNT;
        if (messages.length) {
          this.messageList.unshift(...messages);
          this.earliestMessageId = this.messageList[0].id;
        }
      }),
      catchError(err => {
        this._snackbar.open(TextContent.LOAD_MSGS_MORE_ERROR, 'warn');
        return of([] as ChatMessage[]);
      }),
    ).subscribe();
  }


  private sendMessage(): Observable<any> {
    const currentIdentity = this._store.selectSnapshot(MarketState.currentIdentity);

    return this._rpc.call('chat', [
      'messagepost',
      currentIdentity.id,
      this.inputChannel,
      this.inputChannelType,
      this.textInput.value,
    ]).pipe(
      catchError(() => of({success: false, errorReason: ChatRequestErrorReason.GENERIC})),
      tap((resp: RespChatMessagePost) => {
        let errorType = ChatRequestErrorReason.GENERIC;

        if (isBasicObjectType(resp)) {
          if ((resp.success === true) && (typeof resp.id === 'string') && (resp.id.length > 0)) {
            const addedMessage: ChatMessage = {
              created: Date.now(),
              message: this.textInput.value,
              isOwn: true,
              sender: currentIdentity.address,
              id: resp.id,
              isHighlited: false,
            };
            this.messageList.push(addedMessage);
            this.textInput.setValue('');
            this._cdr.detectChanges();
            return;

          } else if (resp.errorReason) {
            errorType = resp.errorReason;
          }
        }

        // display error here:
        let msg = '';
        switch (errorType) {
        case ChatRequestErrorReason.SMSG_SEND_FAILED: msg = TextContent.SEND_MSG_ERROR_SMSG; break;
        case ChatRequestErrorReason.SIGNING_ERROR: msg = TextContent.SEND_MSG_ERROR_SIGNING; break;
        case ChatRequestErrorReason.SIZE_ERROR: msg = TextContent.SEND_MSG_ERROR_SIZE; break;
        default: msg = TextContent.SEND_MSG_ERROR_GENERIC;
        }
        this._snackbar.open(msg, 'warn');
      })
    );
  }


  private loadChatMessages(identityId: number, count: number, lastMessageId: string = null): Observable<ChatMessage[]> {
    return this._rpc.call('chat', [
        'channelmessages',
        identityId,
        this.inputChannel,
        this.inputChannelType,
        count,
        lastMessageId
      ]).pipe(
        map((resp: RespChatChannelMessages) => this.buildChatMessagesFromResponse(resp))
      );
  }


  private buildChatMessagesFromResponse(response: RespChatChannelMessages): ChatMessage[] {
    if (!isBasicObjectType(response) || (response.success !== true) || !Array.isArray(response.data)) {
      throw new Error(response && response.errorReason ? response.errorReason : ChatRequestErrorReason.GENERIC);
    }
    const chats = response.data.map(msg => {
      if (!isBasicObjectType(msg)) {
        return null;
      }
      const chat: ChatMessage = {
        id: getValueOrDefault(msg.msgid, 'string', ''),
        message: getValueOrDefault(msg.message, 'string', ''),
        created: +msg.created_at > 0 ? +msg.created_at : 0,
        sender: getValueOrDefault(msg.sender_label, 'string', '') || getValueOrDefault(msg.sender_address, 'string', ''),
        isOwn: msg.is_own === true,
        isHighlited: (this.highlitedAddress.length > 0) && (getValueOrDefault(msg.sender_address, 'string', '') === this.highlitedAddress),
      };

      if (chat.isHighlited) {
        chat.highlitedLabel = this.highlitedAddressLabel;
      }
      if (Object.keys(chat).filter(k => typeof chat[k] !== 'boolean' ? !chat[k] : false).length > 0 ) {
        return null;
      }

      return chat;
    }).filter(chat =>
      chat !== null
    ).reverse();

    return chats;
  }

}
