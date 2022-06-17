import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { merge, of, Subject, combineLatest, iif, defer } from 'rxjs';
import {
  catchError, map, switchMap, takeUntil, tap, startWith, debounceTime, distinctUntilChanged, concatMap, take
} from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { WalletInfoState } from 'app/main/store/main.state';
import { WalletInfoStateModel } from 'app/main/store/main.models';

import { ChatConversationModalComponent, ChatConversationModalInputs } from './../../shared/chat-conversation-modal/chat-conversation-modal.component';
import {
  UnfollowChannelConfirmationModalComponent, UnfollowChannelConfirmationModalInput
} from './../chat-modals/unfollow-confirmation-modal/unfollow-confirmation-modal.component';
import { ListingDetailModalComponent, ListingItemDetailInputs } from '../../shared/listing-detail-modal/listing-detail-modal.component';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';
import { DataService } from '../../services/data/data.service';

import { RespChatChannelList, RespChatChannelUnfollow, RespListingItem, RespOrderSearchItem, BID_DATA_KEY} from './../../shared/market.models';
import { getValueOrDefault, isBasicObjectType, parseImagePath } from '../../shared/utils';
import { ChatChannelType, ChatChannelTypeLabels } from '../../services/chats/chats.models';
import { MarketUserActions } from 'app/main-market/store/market.actions';



enum TextContent {
  CHANNEL_TYPE_LABEL_ORDER = 'Order',
  CHANNEL_TYPE_LABEL_LISTING = 'Listing',
  CHANNEL_TYPE_LABEL_OTHER = 'Other',
  LOAD_ERROR = 'Failed to retrieve messages',
  UNFOLLOW_ERROR = 'Could not unfollow this chat at this time',
  MARK_AS_READ_ERROR = '',
  ADDRESS_LABEL_SELLER = 'seller',
}

interface ChatChannelDetails {
  image: string;
  title: string;
  type: string;
  market: {
    address: string;
    name: string;
  };
  itemId: number;
  highliteAddress: string;
  highliteLabel: string;
}

interface ChatChannelItem extends ChatChannelDetails {
  _channel: string;
  _channelType: ChatChannelType;
  hasUnread: boolean;
  lastRead: number;
}


@Component({
  selector: 'market-chat-channels',
  templateUrl: './chat-channels.component.html',
  styleUrls: ['./chat-channels.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatChannelsComponent implements OnInit, OnDestroy {

  readonly filterUnreadOptions: {title: string; value: '' | '0' | '1'}[] = [
    {title: 'All', value: ''},
    {title: 'Unread', value: '1'},
    {title: 'Read', value: '0'},
  ];

  readonly filterTypeOptions: {title: string; value: '' | ChatChannelType}[] = [
    {title: 'All', value: ''},
    {title: TextContent.CHANNEL_TYPE_LABEL_LISTING, value: ChatChannelType.LISTINGITEM},
    {title: TextContent.CHANNEL_TYPE_LABEL_ORDER, value: ChatChannelType.ORDERITEM},
  ];

  filterMarketOptions: {name: string; value: string; }[] = [];

  TypeChatChannel: typeof ChatChannelType = ChatChannelType;

  isLoading: boolean = true;
  identityIsEncrypted: boolean = false;
  displayedChannelIdxs: number[] = [];
  chatChannelsList: ChatChannelItem[] = [];

  filterSearch: FormControl = new FormControl('');
  filterMarket: FormControl = new FormControl('');
  filterUnread: FormControl = new FormControl('');
  filterType: FormControl = new FormControl('');


  private destroy$: Subject<void> = new Subject();
  private controlLoadChats: FormControl = new FormControl(0);
  private filterChange: FormControl = new FormControl();
  private currentyIdentityId: number = 0;
  private defaultMarketImage: string;
  private defaultMarketUrl: string;


  constructor(
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _dialog: MatDialog,
    private _rpc: MarketRpcService,
    private _snackbar: SnackbarService,
    private _sharedService: DataService,
  ) {
    this.defaultMarketImage = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;
    this.defaultMarketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
  }


  ngOnInit() {
    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      tap((identity) => {

        this.filterMarketOptions = [];
        (identity.markets || []).forEach(m => {
          this.filterMarketOptions.push({value: m.receiveAddress, name: m.name});
        });

        if (identity.id > 0) {
          const walletState: WalletInfoStateModel = this._store.selectSnapshot(WalletInfoState);
          this.identityIsEncrypted = (+walletState.unlocked_until > 0) || (walletState.encryptionstatus !== 'Unencrypted');
        }
        this.currentyIdentityId = +identity.id > 0 ? +identity.id : 0;
        this.controlLoadChats.setValue(true);
      }),
      takeUntil(this.destroy$)
    );

    const loadChatChannels$ = this.controlLoadChats.valueChanges.pipe(
      tap((doReset: boolean) => {
        if (doReset) {
          this.chatChannelsList = [];
          this.resetFilters();
        }
        this.isLoading = true;
        this._cdr.detectChanges();
      }),
      switchMap((doReset: boolean) => this._rpc.call('chat', [
        'channellist',
        this.currentyIdentityId,
        null,
        true
      ]).pipe(
        catchError(() => {
          this._snackbar.open(TextContent.LOAD_ERROR, 'warn');
          return of({});
        }),
        map(resp => {
          const newChannels = this.buildChatChannelItems(resp);
          if (doReset) {
            return newChannels;
          }

          let foundIdx = -1;
          const lastExistingChannel = this.chatChannelsList[this.chatChannelsList.length - 1];

          console.log('GOT LAST OF EXISTING: ', lastExistingChannel);

          if (lastExistingChannel) {
            for (let ii = newChannels.length - 1; ii >= 0; ii--) {
              console.log('PROCESSING newchannel: ', ii, '>>', newChannels[ii]);
              if (
                (newChannels[ii]._channel === lastExistingChannel._channel) &&
                (newChannels[ii]._channelType === lastExistingChannel._channelType)
              ) {
                foundIdx = ii;
                break;
              }
            }
          }
          for (let jj = foundIdx + 1; jj < newChannels.length; jj++) {
            this.chatChannelsList.push(newChannels[jj]);
          }
          return this.chatChannelsList;
        }),
      )),
      tap(() => this.isLoading = false),
      takeUntil(this.destroy$)
    );

    const unreadUpdates$ = combineLatest([
      this._store.select(MarketState.unreadChatChannels(ChatChannelType.LISTINGITEM)).pipe(takeUntil(this.destroy$)),
      this._store.select(MarketState.unreadChatChannels(ChatChannelType.ORDERITEM)).pipe(takeUntil(this.destroy$)),
    ]).pipe(
      map(unreads => {
        return ({ listings: unreads[0], orders: unreads[1] });
      })
    );

    const channelUpdates$ = combineLatest([
      loadChatChannels$,
      unreadUpdates$
    ]).pipe(
      tap(data => {
        let countUnread = 0;

        data[0].forEach(channel => {
          switch (channel._channelType) {
          case ChatChannelType.LISTINGITEM: channel.hasUnread = data[1].listings.includes(channel._channel); break;
          case ChatChannelType.ORDERITEM: channel.hasUnread = data[1].orders.includes(channel._channel); break;
          }
          if (channel.hasUnread) {
            countUnread++;
          }
        });

        if (countUnread < [...data[1].listings, ...data[1].orders].length) {
          this.controlLoadChats.setValue(false);
        }

        this.chatChannelsList = data[0];
        this.filterChange.setValue(true);
      }),
      takeUntil(this.destroy$)
    );

    const filterChanged$ = this.filterChange.valueChanges.pipe(
      map(() => this.getFilteredChannelIndexes()),
      tap(results => {
        this.displayedChannelIdxs = results;
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
      this.filterMarket.valueChanges.pipe(takeUntil(this.destroy$)),
      this.filterType.valueChanges.pipe(takeUntil(this.destroy$)),
      this.filterUnread.valueChanges.pipe(takeUntil(this.destroy$)),
    ).pipe(
      tap(() => this.filterChange.setValue(true)),
      takeUntil(this.destroy$)
    );

    merge(
      channelUpdates$,
      identityChange$,
      filterChanged$,
      filterActioned$,
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  clearAllFilters() {
    this.resetFilters();
  }


  actionUnfollowChannel(channelIdx: number) {
    if (this.isLoading || +channelIdx >= this.chatChannelsList.length || +channelIdx < 0) {
      return;
    }

    const channel = this.chatChannelsList[channelIdx];
    const modalInputs: UnfollowChannelConfirmationModalInput = {
      channelType: channel._channelType,
      title: channel.title,
      subtitle: channel.type,
      image: channel.image,
    };

    this._dialog.open(UnfollowChannelConfirmationModalComponent, { data: modalInputs })
      .afterClosed()
      .pipe(
        take(1),
        concatMap(doProceed => iif(

          () => doProceed === true,

          defer(() => {
            this.isLoading = true;

            this._cdr.detectChanges();

            return this._rpc.call('chat', [
              'channelunfollow',
              this.currentyIdentityId,
              channel._channel,
              channel._channelType
            ]).pipe(
              catchError(() => of({} as RespChatChannelUnfollow)),
              tap((result: RespChatChannelUnfollow) => {
                this.isLoading = false;
                if (!isBasicObjectType(result) || result.success !== true) {
                  this._snackbar.open(TextContent.UNFOLLOW_ERROR, 'warn');
                  this._cdr.detectChanges();
                  return;
                }

                this.actionMakeChannelRead(channelIdx);

                this.displayedChannelIdxs = this.displayedChannelIdxs.filter(idx => idx !== channelIdx);
                this._cdr.detectChanges();
                this.chatChannelsList.splice(channelIdx, 1);

                this.filterChange.setValue(true);
              })
            );

          })
        ))
      )
      .subscribe();
  }


  actionMakeChannelRead(channelIdx: number) {
    if (this.isLoading || +channelIdx >= this.chatChannelsList.length || +channelIdx < 0) {
      return;
    }

    const channel = this.chatChannelsList[channelIdx];
    this._store.dispatch(new MarketUserActions.ChatChannelRead(channel._channel, channel._channelType)).pipe(
      catchError(() => {
        this._snackbar.open(TextContent.MARK_AS_READ_ERROR, 'warn');
        return of(false);
      })
    );
  }

  actionShowItemDetail(channelIdx: number): void {
    if (this.isLoading || +channelIdx >= this.chatChannelsList.length || +channelIdx < 0) {
      return;
    }

    const channel = this.chatChannelsList[channelIdx];

    if (channel._channelType !== ChatChannelType.LISTINGITEM) {
      return;
    }

    this._sharedService.getListingDetailsForMarket(channel.itemId, 0).subscribe(
      (listing) => {
        if (+listing.id <= 0) {
          // do something useful here to inform that the listing failed to load??
          return;
        }

        const dialogData: ListingItemDetailInputs = {
          listing,
          canReview: true,
          displayChat: false,
          initTab: 'default',
          displayActions: {
            cart: true,
            governance: false,
            fav: false
          }
        };

        this._dialog.open(
          ListingDetailModalComponent,
          { data: dialogData }
        );
      },
      (err) => {
        // do something useful here
      }
    );
  }


  actionOpenChatMessages(channelIdx: number) {
    if (this.isLoading || +channelIdx >= this.chatChannelsList.length || +channelIdx < 0) {
      return;
    }

    const channel = this.chatChannelsList[channelIdx];
    const modalInputs: ChatConversationModalInputs = {
      channel: channel._channel,
      channelType: channel._channelType,
      title: channel.title,
      subtitle: channel.type,
      highlitedAddress: channel.highliteAddress,
      highlitedLabel: channel.highliteLabel,
    };

    this._dialog.open(ChatConversationModalComponent, { data: modalInputs });
  }


  private resetFilters() {
    this.filterSearch.setValue('', {emitEvent: false});
    this.filterMarket.setValue('', {emitEvent: false});
    this.filterUnread.setValue('', {emitEvent: false});
    this.filterType.setValue('', {emitEvent: false});

    this.filterChange.setValue(true);
  }


  private getFilteredChannelIndexes(): number[] {
    const indexes: number[] = [];
    if (this.chatChannelsList.length === 0) {
      return indexes;
    }

    const searchTerm = this.filterSearch.value.toLowerCase();
    const marketAddress = this.filterMarket.value;
    const filterType = this.filterType.value;
    const filterUnread = this.filterUnread.value;

    this.chatChannelsList.forEach((channel, idx) => {
      if (
        channel.title.toLowerCase().includes(searchTerm) &&
        (marketAddress === '' || (channel.market.address === marketAddress)) &&
        (filterType === '' || (channel._channelType === filterType)) &&
        (filterUnread === '' || channel.hasUnread === !!+filterUnread)
      ) {
        indexes.push(idx);
      }
    });

    return indexes;

  }


  private buildChatChannelItems(source: RespChatChannelList): ChatChannelItem[] {
    const items: ChatChannelItem[] = [];

    if (!isBasicObjectType(source) || (source.success !== true) || !Array.isArray(source.data)) {
      return items;
    }

    const marketMap: Map<string, string> = new Map();
    this.filterMarketOptions.forEach(m => marketMap.set(m.value, m.name || ''));

    source.data.forEach(item => {

      if (!isBasicObjectType(item) || !isBasicObjectType(item.channelDetails)) {
        return;
      }

      let builtItem: ChatChannelItem = {
        _channel: getValueOrDefault(item.channel, 'string', ''),
        _channelType: getValueOrDefault(item.channel_type, 'string', '') as ChatChannelType,
        image: null,
        title: null,
        type: null,
        market: null,
        hasUnread: getValueOrDefault(item.has_unread, 'boolean', false),
        lastRead: +item.last_read >= 0 && Number.isSafeInteger(+item.last_read) ? +item.last_read : 0,
        itemId: 0,
        highliteAddress: '',
        highliteLabel: '',
      };

      let details: ChatChannelDetails;
      switch (builtItem._channelType) {
        case ChatChannelType.LISTINGITEM: details = this.getListingChatChannelDetails(item.channelDetails as RespListingItem); break;
        case ChatChannelType.ORDERITEM: details = this.getOrderChatChannelDetails(item.channelDetails as RespOrderSearchItem); break;
        default: details = this.getDefaultChatChannelDetails();
      }

      builtItem = {...builtItem, ...details};
      builtItem.market.name = marketMap.has(builtItem.market.address) ?
        marketMap.get(builtItem.market.address) || builtItem.market.address : builtItem.market.address;

      if (!builtItem._channel || (Object.keys(builtItem).findIndex(k => builtItem[k] === null) > -1)) {
        return;
      }
      items.push(builtItem);

    });

    return items;
  }


  private getListingChatChannelDetails(source: RespListingItem): ChatChannelDetails {
    const item = this.getDefaultChatChannelDetails();

    if (isBasicObjectType(source) && isBasicObjectType(source.ItemInformation)) {
      item.title = getValueOrDefault(source.ItemInformation.title, 'string', item.title);

      if (Array.isArray(source.ItemInformation.Images) && source.ItemInformation.Images.length) {
        let featured = source.ItemInformation.Images.find(img => img.featured);
        if (featured === undefined) {
          featured = source.ItemInformation.Images[0];
        }

        item.image =  parseImagePath(featured, 'MEDIUM', this.defaultMarketUrl) ||
                                  parseImagePath(featured, 'ORIGINAL', this.defaultMarketUrl) ||
                                  item.image;
      }

      item.market.address = getValueOrDefault(source.market, 'string', item.market.address);
    }

    item.highliteAddress = getValueOrDefault(source.seller, 'string', '');
    if (item.highliteAddress.length > 0) {
      item.highliteLabel = TextContent.ADDRESS_LABEL_SELLER;
    }

    item.itemId = +source.id > 0 ? +source.id : item.itemId;

    item.type = this.getChannelTypeLabel(ChatChannelType.LISTINGITEM);

    return item;
  }


  private getOrderChatChannelDetails(source: RespOrderSearchItem): ChatChannelDetails {
    const item = this.getDefaultChatChannelDetails();

    if (
      isBasicObjectType(source) &&
      Array.isArray(source.OrderItems) &&
      (source.OrderItems.length > 0) &&
      isBasicObjectType(source.OrderItems[0]) &&
      isBasicObjectType(source.OrderItems[0].Bid)
    ) {

      if (isBasicObjectType(source.OrderItems[0].Bid.ListingItem)) {
        const li = source.OrderItems[0].Bid.ListingItem;

        if (isBasicObjectType(li.ItemInformation)) {
          item.title = getValueOrDefault(li.ItemInformation.title, 'string', item.title);

          if (Array.isArray(li.ItemInformation.Images) && li.ItemInformation.Images.length) {
            let featured = li.ItemInformation.Images.find(img => img.featured);
            if (featured === undefined) {
              featured = li.ItemInformation.Images[0];
            }

            item.image =  parseImagePath(featured, 'MEDIUM', this.defaultMarketUrl) ||
                          parseImagePath(featured, 'ORIGINAL', this.defaultMarketUrl) ||
                          item.image;
          }
        }
      }

      if (Array.isArray(source.OrderItems[0].Bid.BidDatas)) {
        for (const bidData of source.OrderItems[0].Bid.BidDatas) {
          if (isBasicObjectType(bidData) && bidData.key === BID_DATA_KEY.MARKET_KEY) {
            item.market.address = getValueOrDefault(bidData.value, 'string', item.market.address);
            break;
          }
        }
      }

      item.itemId = +source.id > 0 ? +source.id : item.itemId;

      item.type = this.getChannelTypeLabel(ChatChannelType.ORDERITEM);
    }

    return item;
  }


  private getDefaultChatChannelDetails(): ChatChannelDetails {
    const item: ChatChannelDetails = {
      title: '',
      image: this.defaultMarketImage,
      market: {
        address: '',
        name: '',
      },
      type: this.getChannelTypeLabel(ChatChannelType.OTHER),
      itemId: 0,
      highliteAddress: '',
      highliteLabel: '',
    };
    return item;
  }


  private getChannelTypeLabel(channelType: ChatChannelType): string {
    switch (channelType) {
      case ChatChannelType.LISTINGITEM: return ChatChannelTypeLabels.LISTINGITEM; break;
      case ChatChannelType.ORDERITEM: return ChatChannelTypeLabels.ORDERITEM; break;
      default: return ChatChannelTypeLabels.OTHER;
    }
  }

}
