import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, of, merge, iif, defer } from 'rxjs';
import { map, catchError, tap, takeUntil, startWith, debounceTime, distinctUntilChanged, take, concatMap } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';

import {
  ChatParticipantRemoveConfirmationModalInputs,
  ChatParticipantRemoveConfirmationModalComponent
} from './../chat-modals/chat-participant-remove-confirmation-modal/chat-participant-remove-confirmation-modal.component';
import {
  ChatParticipantEditInputs,
  ChatParticipantEditModalComponent,
  ChatParticipantEditedDetails
} from '../chat-modals/chat-participant-edit-modal/chat-participant-edit-modal.component';

import { ChatRequestErrorReason, RespChatParticipantListItem, RespChatParticipantUpdate } from '../../shared/market.models';
import { getValueOrDefault, isBasicObjectType } from 'app/main-market/shared/utils';


enum TextContent {
  RETRIEVE_ERROR = 'Failed to fetch the list correctly!',
  LABEL_REMOVE_ERROR = 'Removal of the address label failed!',
  LABEL_REMOVE_SUCCESS = 'Successfully removed address label',
}


interface ChatPerson {
  address: string;
  label: string;
}


@Component({
  selector: 'market-chat-participants',
  templateUrl: './chat-participants.component.html',
  styleUrls: ['./chat-participants.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatParticipantsComponent implements OnInit, OnDestroy {

  personsList: ChatPerson[] = [];
  displayPersonIdx: number[] = [];

  isLoading: boolean = true;

  filterSearch: FormControl = new FormControl('');

  private destroy$: Subject<void> = new Subject();
  private doRefresh$: FormControl = new FormControl(true);


  constructor(
    private _cdr: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _rpc: MarketRpcService,
    private _snackbar: SnackbarService,
  ) { }

  ngOnInit() {

    const getList$ = this.fetchParticipants().pipe(
      tap(persons => {
        this.personsList = persons;
        this.doRefresh$.setValue(true);
      }),
    );

    const performRefresh$ = this.doRefresh$.valueChanges.pipe(
      tap(() => {
        if (this.isLoading) {
          this.isLoading = false;
        }
        this.displayPersonIdx = this.getFilteredItems();
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );

    const filterActioned$ = merge(
      this.filterSearch.valueChanges.pipe(
        startWith(this.filterSearch.value),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),
    ).pipe(
      tap(() => this.doRefresh$.setValue(true)),
      takeUntil(this.destroy$)
    );


    merge(
      performRefresh$,
      filterActioned$,
      getList$
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();

  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  actionEditParticipantDetails(idx: number) {
    if ((idx < 0) || (idx >= this.personsList.length)) {
      return;
    }

    const data: ChatParticipantEditInputs = {
      address: this.personsList[idx].address,
      label: this.personsList[idx].label,
    };
    this._dialog.open(ChatParticipantEditModalComponent, { data }).afterClosed().pipe(
      take(1),
      concatMap((updatedDetails: ChatParticipantEditedDetails) => iif(
        () => isBasicObjectType(updatedDetails),
        defer(() => {
          if (this.personsList[idx].address !== updatedDetails.address) {
            return;
          }
          this.personsList[idx].label = updatedDetails.label;
          this._cdr.detectChanges();
        })
      ))
    ).subscribe();
  }


  actionRemoveAddressLabel(idx: number) {
    if ((idx < 0) || (idx >= this.personsList.length)) {
      return;
    }

    const data: ChatParticipantRemoveConfirmationModalInputs = {
      address: this.personsList[idx].address,
      label: this.personsList[idx].label,
    };
    this._dialog.open(ChatParticipantRemoveConfirmationModalComponent, { data }).afterClosed().pipe(
      take(1),
      concatMap(doAction => iif(
        () => !!doAction,

        defer(() => this.deleteAddressLabel(data.address).pipe(
          tap(success => {
            if (success) {
              this.displayPersonIdx = this.displayPersonIdx.filter(dpidx => dpidx !== idx);
              this.personsList.splice(idx, 1);
            }
          })
        ))
      ))
    ).subscribe();
  }


  clearAllFilters() {
    this.resetFilters();
  }


  private fetchParticipants(): Observable<ChatPerson[]> {
    return this._rpc.call('chat', ['participantlist']).pipe(
      catchError(() => of({success: false, errorReason: ChatRequestErrorReason.GENERIC})),
      map((resp: RespChatParticipantListItem) => {
        const chatPersons: ChatPerson[] = [];

        if (!isBasicObjectType(resp) || !resp.success || !Array.isArray(resp.data)) {
          const errMsg = TextContent.RETRIEVE_ERROR;
          this._snackbar.open(errMsg, 'warn');
          return chatPersons;
        }

        resp.data.forEach(item => {
          if (isBasicObjectType(item)) {
            const person: ChatPerson = {
              address: getValueOrDefault(item.address, 'string', ''),
              label: getValueOrDefault(item.label, 'string', ''),
            };

            chatPersons.push(person);
          }
        });

        return chatPersons;
      }),
    );
  }


  private deleteAddressLabel(address: string): Observable<boolean> {
    return this._rpc.call('chat', ['participantupdate', address, null]).pipe(
      catchError(() => of({success: false, errorReason: ChatRequestErrorReason.GENERIC})),
      map((resp: RespChatParticipantUpdate) => {
        if (!isBasicObjectType(resp) || !resp.success) {
          this._snackbar.open(TextContent.LABEL_REMOVE_ERROR, 'warn');
          return false;
        }
        this._snackbar.open(TextContent.LABEL_REMOVE_SUCCESS, 'success');
        return true;
      })
    );
  }


  private getFilteredItems(): number[] {
    const indexes: number[] = [];

    const searchValue: string = this.filterSearch.value.toLowerCase();

    this.personsList.forEach((p, idx) => {
      if (p.address.includes(searchValue) || p.label.includes(searchValue)) {
        indexes.push(idx);
      }
    });

    return indexes;
  }


  private resetFilters() {
    this.filterSearch.setValue('', {emitEvent: false});

    this.doRefresh$.setValue(true);
  }

}
