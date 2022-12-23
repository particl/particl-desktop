import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, of, merge, defer, iif, combineLatest } from 'rxjs';
import {
  takeUntil, tap, switchMap, catchError, startWith, debounceTime,
  distinctUntilChanged, filter, auditTime, concatMap, finalize, take, map
} from 'rxjs/operators';

import { Store, Select } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { Particl } from 'app/networks/networks.module';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { BidOrderService } from '../../services/orders/orders.service';
import { DataService } from '../../services/data/data.service';
import { MarketSocketService } from '../../services/market-rpc/market-socket.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { ListingDetailModalComponent, ListingItemDetailInputs } from '../../shared/listing-detail-modal/listing-detail-modal.component';
import { CancelBidModalComponent } from './cancel-bid-modal/cancel-bid-modal.component';
import { PayOrderModalComponent } from './pay-order-modal/pay-order-modal.component';
import { ConfirmOrderDeliveredModalComponent } from './confirm-order-delivered-modal/confirm-order-delivered-modal.component';
import {
  ResendOrderActionConfirmationModalComponent
} from './resend-order-action-confirmation-modal/resend-order-action-confirmation-modal.component';
import { ChatConversationModalComponent, ChatConversationModalInputs } from './../../shared/chat-conversation-modal/chat-conversation-modal.component';

import { isBasicObjectType } from '../../shared/utils';

import { WalletInfoStateModel } from 'app/networks/particl/particl.models';
import { OrderItem, BuyFlowOrderType, OrderUserType, ActionTransitionParams } from '../../services/orders/orders.models';
import { Identity } from '../../store/market.models';
import { ORDER_ITEM_STATUS } from '../../shared/market.models';
import { ChatChannelType, ChatChannelTypeLabels } from '../../services/chats/chats.models';


enum TextContent {
  LOADING_ERROR = 'Failed to load orders correctly',
  FILTER_LABEL_ALL_ORDERS = 'All Items',
  ORDER_UPDATE_ERROR = 'Order update failed',
  ACTIONING_ORDER = 'Processing the selected item',
  SMSG_RESEND_SUCCESS = 'Successfully re-sent the order status to the seller',
  SMSG_RESEND_ERROR = 'Resnding of the order status failed! Please try again later',
}

interface BuyflowStep {
  value: BuyFlowOrderType;
  title: string;
}


interface RenderedOrderItem extends OrderItem {
  _hasUnreadChat: boolean;
}


@Component({
  selector: 'market-buy-orders',
  templateUrl: './buy-orders.component.html',
  styleUrls: ['./buy-orders.component.scss']
})
export class BuyOrdersComponent implements OnInit, OnDestroy {

  @Select(MarketState.setting('txUrl')) txUrl: Observable<string>;

  identityIsEncrypted: boolean = false;
  isLoading: boolean = true;

  querySearch: FormControl = new FormControl('');
  queryFilterAttention: FormControl = new FormControl(false);
  queryFilterComplete: FormControl = new FormControl(true);
  queryFilterMarket: FormControl = new FormControl('');
  queryFilterStatus: FormControl = new FormControl('');

  filterOptionsMarkets: {[marketKey: string]: string } = {};
  filterOptionsStatus: {value: BuyFlowOrderType | '', title: string, count: number}[] = [];

  happyBuyflow: { steps: BuyflowStep[], stateLookup: {[state in BuyFlowOrderType]?: number} } = {
    steps: [],
    stateLookup: {},
  };

  filteredOrderIdxs: number[] = [];
  ordersList: RenderedOrderItem[] = [];


  private readonly viewer: OrderUserType = 'BUYER';
  private destroy$: Subject<void> = new Subject();
  private currentIdentity: Identity = null;
  private loadOrdersControl: FormControl = new FormControl(true);
  private loadMarketsControl: FormControl = new FormControl();
  private renderOrdersControl: FormControl = new FormControl();


  constructor(
    private _route: ActivatedRoute,
    private _store: Store,
    private _cdr: ChangeDetectorRef,
    private _socket: MarketSocketService,
    private _orderService: BidOrderService,
    private _sharedService: DataService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _unlocker: WalletEncryptionService
  ) {

    const query = this._route.snapshot.queryParams;
    const toggleOrdersNeedingAttention = query['toggleOrdersNeedingAttention'];
    if (toggleOrdersNeedingAttention) {
      this.queryFilterAttention.setValue(!!(+toggleOrdersNeedingAttention));
    }

    const madctStates = this._orderService.getOrderedStateList('MAD_CT');

    this.filterOptionsStatus = madctStates.map(
      osl => ({title: osl.filterLabel ? osl.filterLabel : osl.label, value: osl.stateId, count: 0})
    );
    this.filterOptionsStatus.unshift({title: TextContent.FILTER_LABEL_ALL_ORDERS, value: '', count: 0});

    this.happyBuyflow.steps = madctStates.filter(s => s.order >= 0).map(s => ({title: s.label, value: s.stateId}));
    this.happyBuyflow.steps.forEach((step, stepIdx) => this.happyBuyflow[step.value] = stepIdx);
  }


  ngOnInit() {

    const identityChange$ = this._store.select(MarketState.currentIdentity).pipe(
      tap((identity) => {
        this.currentIdentity = identity;
        if (identity.id > 0) {
          const walletState = this._store.selectSnapshot<WalletInfoStateModel>(Particl.State.Wallet.Info);
          this.identityIsEncrypted = (+walletState.unlocked_until > 0) || (walletState.encryptionstatus !== 'Unencrypted');
        }
        this.loadMarketsControl.setValue(identity.id);
      }),
      takeUntil(this.destroy$)
    );

    const marketLoader$ = this.loadMarketsControl.valueChanges.pipe(
      startWith(0),
      distinctUntilChanged(),
      tap(() => {
        this.filteredOrderIdxs = [];
        this.ordersList = [];
        this.filterOptionsMarkets = {};
        this._cdr.detectChanges();
      }),
      switchMap(() => this.fetchMarkets().pipe(
        tap(markets => {
          this.filterOptionsMarkets = {};
          markets.forEach(m => this.filterOptionsMarkets[m.key] = m.name);
          this.loadOrdersControl.setValue(true);
        }),
      )),
      takeUntil(this.destroy$)
    );

    const orderLoader$ = combineLatest([
      this.loadOrdersControl.valueChanges.pipe(
        tap((doClear: boolean) => {
          this.isLoading = true;

          if (!!doClear) {
            this.filteredOrderIdxs = [];
            this.ordersList = [];
            this.filterOptionsStatus.forEach(s => s.count = 0);
          }

          this._cdr.detectChanges();

        }),
        switchMap(() => defer(() => this.fetchOrders())),
        takeUntil(this.destroy$)
      ),

      this._store.select(MarketState.unreadChatChannels(ChatChannelType.ORDERITEM)).pipe(takeUntil(this.destroy$))

    ]).pipe(
      tap(dataSources => {
        const unreadTopicSet = new Set(dataSources[1]);
        const orders = dataSources[0];

        const isInit = this.ordersList.length === 0;

        if (isInit) {
          this.ordersList.push(...orders);
        } else {
          // Ensure that the filters are cleared if there were not already
          //  (wouldn't be if finding updates rather than requesting from scratch)
          this.filterOptionsStatus.forEach(s => s.count = 0);
        }

        orders.forEach(newOrder => {
          // update filter counts
          const optionTotal = this.filterOptionsStatus.find(s => s.value === '');
          if (optionTotal) {
            optionTotal.count++;
          }

          const optionStatus = this.filterOptionsStatus.find(s => s.value === newOrder.currentState.state.stateId);
          if (optionStatus) {
            optionStatus.count++;
          }

          // update the order list if existing order were retrieved
          if (!isInit) {
            const existingOrderIdx = this.ordersList.findIndex(o => o.orderId === newOrder.orderId);

            if (existingOrderIdx === -1) {
              this.ordersList.push(newOrder);
            } else if (
              (this.ordersList[existingOrderIdx].currentState.state.stateId !== newOrder.currentState.state.stateId) &&
              (this.ordersList[existingOrderIdx].orderId === newOrder.orderId)
            ) {
              this.ordersList[existingOrderIdx] = newOrder;
            }
          }
        });

        this.ordersList.forEach(o => {
          o._hasUnreadChat = unreadTopicSet.has(o.orderHash);
        });

        this.isLoading = false;
        this.renderOrdersControl.setValue(null);
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );

    const updateDisplay$ = this.renderOrdersControl.valueChanges.pipe(
      switchMap(() => this.filterDisplayableOptions()),
      tap(indexes => {
        this.filteredOrderIdxs = indexes;
        this._cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    );


    const filterChange$ = merge(
      this.querySearch.valueChanges.pipe(
        startWith(this.querySearch.value),
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      ),

      this.queryFilterMarket.valueChanges.pipe(takeUntil(this.destroy$)),
      this.queryFilterComplete.valueChanges.pipe(takeUntil(this.destroy$)),
      this.queryFilterAttention.valueChanges.pipe(takeUntil(this.destroy$)),
      this.queryFilterStatus.valueChanges.pipe(takeUntil(this.destroy$)),
    ).pipe(
      tap(() => this.renderOrdersControl.setValue(null))
    );

    /**
     * Doing the socket subscription here instead of the service, because:
     *    the orders service is not destroyed when the component goes out of scope
     *    (is not a component provided service but a market module one),
     *    leaving no way to reliably determine when to unsubscribe from the created (and subscribed) socket listener observables.
     *    The alternative would be to create a store of socket listeners with a tracker of subcribers
     *    and then ask the subscribers to unregister themselves, but that's beating around the bush for no real benefit.
     *    Until an alternative solution presents itself, the socket listeners are registered in the component.
     */

    const listeners$: Observable<any>[] = [];

    // typecasting the string to 'any' so as to ignore the tslint issue about a string being an invalid argument
    this._orderService.getListenerIdsForUser(this.viewer).forEach(id =>
      listeners$.push(this._socket.getSocketMessageListener(id as any).pipe(takeUntil(this.destroy$)))
    );

    let incomingUpdate$ = of({});
    if (listeners$.length > 0) {
      incomingUpdate$ = merge(...listeners$).pipe(
        filter(msg => isBasicObjectType(msg) && (typeof this.filterOptionsMarkets[msg.market] === 'string')),
        auditTime(3_000), // After first message arrives, wait x number of seconds (for more possible arriving messages), before continuing
        tap(() => {
          this.loadOrdersControl.setValue(false);
        }),
        takeUntil(this.destroy$)
      );
    }


    merge(
      marketLoader$,
      orderLoader$,
      updateDisplay$,
      filterChange$,
      identityChange$,
      incomingUpdate$
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByOrderIdxFn(idx: number, item: number) {
    return item;
  }


  clearAllFilters(): void {
    this.querySearch.setValue('', {emitEvent: false});
    this.queryFilterAttention.setValue(false, {emitEvent: false});
    this.queryFilterComplete.setValue(true, {emitEvent: false});
    this.queryFilterMarket.setValue('', {emitEvent: false});
    this.queryFilterStatus.setValue('', {emitEvent: false});

    this.renderOrdersControl.setValue(null);
  }


  openListingDetailModal(listingId: number): void {
    this._sharedService.getListingDetailsForMarket(listingId, 0).subscribe(
      (listing) => {
        if (+listing.id <= 0) {
          // do something useful here to inform that the listing failed to load??
          return;
        }

        const dialogData: ListingItemDetailInputs = {
          listing,
          displayChat: true,
          initTab: 'default',
          displayActions: {
            cart: false,
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
        // do something useful here to inform that the orders failed to load??
      }
    );
  }


  openChatModal(orderIdx: number): void {
    if (this.isLoading || orderIdx >= this.ordersList.length || orderIdx < 0) {
      return;
    }
    const orderItem = this.ordersList[orderIdx];

    const dialogData: ChatConversationModalInputs = {
      channel: orderItem.orderHash,
      channelType: ChatChannelType.ORDERITEM,
      title: orderItem.listing.title,
      subtitle: ChatChannelTypeLabels.ORDERITEM
    };

    this._dialog.open(ChatConversationModalComponent, {data: dialogData});
  }


  executeAction(orderItem: OrderItem, moveToState: BuyFlowOrderType): void {
    // @TODO: zaSmilingIdiot 2020-09-21 -> This lookup for the modals to display should probably all be handled in the service.
    //  However, since the service is not destroyed when the component is, and the order service would
    //    then also require matdialog and other service availability, it leaves instances of these additional services
    //    hanging around for no real benefit or reason.
    //  Hence, doing this 'manual' checking here for now, but this needs to be resolved/moved in the future

    let actionable$: Observable<OrderItem>;
    let modalComponent: any;
    const modalData = {
      orderItem
    };

    const action$ = (extraArgs?: ActionTransitionParams) => {
      return defer(() => {
        this._dialog.open(ProcessingModalComponent, {
          disableClose: true,
          data: { message: TextContent.ACTIONING_ORDER }
        });

        return this._unlocker.unlock({timeout: 10}).pipe(
          concatMap((unlocked) => iif(
            () => unlocked,
            defer(() => this._orderService.actionOrderItem(orderItem, moveToState, this.viewer, extraArgs))
          ))
        );
      });
    };

    switch (moveToState) {
      case ORDER_ITEM_STATUS.CANCELLED:
        modalComponent = CancelBidModalComponent;
        break;
      case ORDER_ITEM_STATUS.ESCROW_REQUESTED:
        modalComponent = PayOrderModalComponent;
        break;
      case ORDER_ITEM_STATUS.COMPLETE:
        modalComponent = ConfirmOrderDeliveredModalComponent;
        break;
    }

    if (modalComponent === undefined) {
      actionable$ = action$();
    } else {
      actionable$ = this._dialog.open(
        modalComponent,
        { data: modalData }
      ).afterClosed().pipe(
        concatMap((modalResponse) => iif(
          () => isBasicObjectType(modalResponse) && !!modalResponse.doAction,
          defer(() => action$(modalResponse.params))
        ))
      );
    }

    actionable$.pipe(
      finalize(() => this._dialog.closeAll())
    ).subscribe(
      (newItem) => {
        if (
          (orderItem.orderId === newItem.orderId) &&
          (orderItem.currentState.state.stateId !== newItem.currentState.state.stateId)
        ) {
          const foundOrderIdx = this.ordersList.findIndex(o => o.orderId === orderItem.orderId);
          if (foundOrderIdx > -1) {
            const roi: RenderedOrderItem = {...newItem, _hasUnreadChat: this.ordersList[foundOrderIdx]._hasUnreadChat };
            this.ordersList[foundOrderIdx] = roi;

            const decStatus = this.filterOptionsStatus.find(s => s.value === orderItem.currentState.state.stateId);
            if (decStatus) {
              decStatus.count--;
            }

            const incStatus = this.filterOptionsStatus.find(s => s.value === newItem.currentState.state.stateId);
            if (incStatus) {
              incStatus.count++;
            }

            this.renderOrdersControl.setValue(null);

            this._cdr.detectChanges();
          }
        }
      },
      (err) => this._snackbar.open(TextContent.ORDER_UPDATE_ERROR, 'err')
    );
  }


  resendActionMessage(msgIds: string[]): void {
    if (!msgIds.length) {
      return;
    }
    this._dialog.open(ResendOrderActionConfirmationModalComponent).afterClosed().pipe(
      take(1),
      concatMap(doProceed => iif(
        () => !!doProceed,
        defer(() =>  this._unlocker.unlock({ timeout: 10 }).pipe(
          concatMap((unlocked: boolean) => iif(
            () => unlocked,
            defer(() => this._orderService.resendSmsgMessages(msgIds))
          ))
        ))
      ))
    )
    .subscribe(
      (success) => {
        if (success) {
          this._snackbar.open(TextContent.SMSG_RESEND_SUCCESS);
          return;
        }
        this._snackbar.open(TextContent.SMSG_RESEND_ERROR, 'warn');
      }
    );
  }


  private fetchOrders(): Observable<RenderedOrderItem[]> {
    if (!this.currentIdentity || !this.currentIdentity.address) {
      return of([] as RenderedOrderItem[]);
    }

    return this._orderService.fetchBids(this.viewer).pipe(
      catchError(() => {
        this._snackbar.open(TextContent.LOADING_ERROR, 'warn');
        return of([] as OrderItem[]);
      }),
      map(orderItems => orderItems.map(oi => {
        const roi: RenderedOrderItem = {...oi, _hasUnreadChat: false};
        return roi;
      }))
    );
  }


  private fetchMarkets(): Observable<{ key: string; name: string; }[]> {
    if (!this.currentIdentity || !(+this.currentIdentity.id > 0)) {
      return of([] as { key: string; name: string; }[]);
    }
    return of(this.currentIdentity.markets.map(m => ({key: m.receiveAddress, name: m.name})));
  }


  private filterDisplayableOptions(): Observable<number[]> {
    return defer(() => {
      const searchString = (this.querySearch.value || '').toLocaleLowerCase();
      const filterMarket = this.queryFilterMarket.value;
      const showOnlyAttention = this.queryFilterAttention.value;
      const showComplete = this.queryFilterComplete.value;
      const filterStatus = this.queryFilterStatus.value;

      const idxList: number[] = [];

      this.ordersList.forEach((order, orderIdx) => {
        const addItem = order.listing.title.toLocaleLowerCase().includes(searchString) &&
            (!filterMarket ? true : order.marketKey === filterMarket) &&
            (
              filterStatus ?
              order.currentState.state.stateId === filterStatus :

              (showOnlyAttention ? order.currentState.actions.PRIMARY.length > 0 : true) &&
              (showComplete ? true : !order.currentState.state.isFinalState)
            );

        if (addItem) {
          idxList.push(orderIdx);
        }
      });

      return of(idxList);
    });
  }

}
