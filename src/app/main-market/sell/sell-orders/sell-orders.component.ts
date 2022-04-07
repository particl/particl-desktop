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
import { WalletInfoState } from 'app/main/store/main.state';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';

import { IpcService } from 'app/core/services/ipc.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { BidOrderService } from '../../services/orders/orders.service';
import { DataService } from '../../services/data/data.service';
import { MarketSocketService } from '../../services/market-rpc/market-socket.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { ListingDetailModalComponent } from '../../shared/listing-detail-modal/listing-detail-modal.component';
import { RejectBidModalComponent } from '../modals/reject-bid-modal/reject-bid-modal.component';
import { CancelBidModalComponent } from '../modals/cancel-bid-modal/cancel-bid-modal.component';
import { EscrowPaymentModalComponent } from '../modals/escrow-payment-modal/escrow-payment-modal.component';
import { OrderShippedModalComponent } from '../modals/order-shipped-modal/order-shipped-modal.component';
import { AcceptBidModalComponent } from '../modals/accept-bid-modal/accept-bid-modal.component';
import {
  ResendOrderActionConfirmationModalComponent
} from '../modals/resend-order-action-confirmation-modal/resend-order-action-confirmation-modal.component';
import { ChatMessageModalComponent, ChatMessageModalInputs } from './../../shared/chat-message-modal/chat-message-modal.component';
import { isBasicObjectType } from '../../shared/utils';

import { WalletInfoStateModel } from 'app/main/store/main.models';
import { OrderItem, BuyFlowOrderType, OrderUserType, ActionTransitionParams } from '../../services/orders/orders.models';
import { Identity } from '../../store/market.models';
import { ORDER_ITEM_STATUS } from '../../shared/market.models';
import { ChatChannelType, ChatChannelTypeLabels } from '../../services/chats/chats.models';


enum TextContent {
  LOADING_ERROR = 'Failed to load orders correctly',
  FILTER_LABEL_ALL_ORDERS = 'All Items',
  ORDER_UPDATE_ERROR = 'Order update failed',
  ERROR_INSUFFICIENT_FUNDS = 'Insufficient funds to process order',
  ACTIONING_ORDER = 'Processing the selected item',
  LABEL_DEFAULT_EXPORT_FILENAME_CSV = 'Filtered Orders - ${date}.csv',
  CSV_EXPORTED_SUCCESS = 'Exported Successfully!',
  CSV_EXPORTED_ERROR = 'Export Failed ${reason}',
  SMSG_RESEND_SUCCESS = 'Successfully re-sent the order status to the buyer',
  SMSG_RESEND_ERROR = 'Resnding of the order status failed! Please try again later',
}

interface BuyflowStep {
  value: BuyFlowOrderType;
  title: string;
}


interface ExportSellOrderItem {
  orderId: number;
  orderItemId: number;
  orderHash: string;
  orderCurrentStatusLabel: string;
  orderCurrentStatusId: string;
  orderIsFinalized: boolean;
  timestampCreated: number;
  timestampUpdated: number;
  marketKey: string;
  listingId: number;
  listingTitle: string;
  listingHash: string;
  priceItem: string;
  priceShipping: string;
  priceSellerEscrow: string;
  priceSaleValue: string;
  shippingName: string;
  shippingAddress: string;
  noteBuyerEscrow: string;
  noteBuyerRelease: string;
  txnRelease: string;
  txnEscrow: string;
}


interface RenderedOrderItem extends OrderItem {
  _hasUnreadChat: boolean;
}


@Component({
  selector: 'market-sell-orders',
  templateUrl: './sell-orders.component.html',
  styleUrls: ['./sell-orders.component.scss']
})
export class SellOrdersComponent implements OnInit, OnDestroy {

  @Select(CoreConnectionState.isTestnet) isTestnet: Observable<boolean>;

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


  private readonly viewer: OrderUserType = 'SELLER';
  private destroy$: Subject<void> = new Subject();
  private currentIdentity: Identity = null;
  private loadOrdersControl: FormControl = new FormControl(true);
  private loadMarketsControl: FormControl = new FormControl();
  private renderOrdersControl: FormControl = new FormControl();


  constructor(
    private _ipc: IpcService,
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
          const walletState: WalletInfoStateModel = this._store.selectSnapshot(WalletInfoState);
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
              this.ordersList.unshift(newOrder);
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
     *    and then ask the subscribers to unregister themselves, but that's beating aound the bush for no real benefit.
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
        tap(() => this.loadOrdersControl.setValue(false)),
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

        this._dialog.open(
          ListingDetailModalComponent,
          {
            data: {
              listing,
              canChat: true,
              initTab: 'default',
              displayActions: {
                cart: false,
                governance: false,
                fav: false
              }
            }
          }
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

    const dialogData: ChatMessageModalInputs = {
      channel: orderItem.orderHash,
      channelType: ChatChannelType.ORDERITEM,
      title: orderItem.listing.title,
      subtitle: ChatChannelTypeLabels.ORDERITEM
    };

    this._dialog.open(ChatMessageModalComponent, {data: dialogData});
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
      case ORDER_ITEM_STATUS.ACCEPTED:
        modalComponent = AcceptBidModalComponent;
        break;
      case ORDER_ITEM_STATUS.REJECTED:
        modalComponent = RejectBidModalComponent;
        break;
      case ORDER_ITEM_STATUS.CANCELLED:
        modalComponent = CancelBidModalComponent;
        break;
      case ORDER_ITEM_STATUS.ESCROW_COMPLETED:
        modalComponent = EscrowPaymentModalComponent;
        break;
      case ORDER_ITEM_STATUS.SHIPPED:
        modalComponent = OrderShippedModalComponent;
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
      (err) => {
        let errMsg = TextContent.ORDER_UPDATE_ERROR;
        if (typeof err === 'string') {
          if (err.includes('Insufficient') && err.includes('funds')) {
            errMsg = TextContent.ERROR_INSUFFICIENT_FUNDS;
          }
        }
        this._snackbar.open(errMsg, 'err');
      }
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


  exportDisplayedOrders(): void {
    if (this.filteredOrderIdxs.length === 0) {
      return;
    }

    const currentDate = new Date();
    const dateLabel = [
      `${currentDate.getFullYear()}`.padStart(2, '0'),
      `${currentDate.getMonth()}`.padStart(2, '0'),
      `${currentDate.getDate()}`.padStart(2, '0'),
      `${currentDate.getHours()}`.padStart(2, '0'),
      `${currentDate.getMinutes()}`.padStart(2, '0')
    ].join('_');

    const options = {
      modalType: 'SaveDialog',
      modalOptions: {
        title: 'Save csv',
        defaultPath : TextContent.LABEL_DEFAULT_EXPORT_FILENAME_CSV.replace('${date}', dateLabel),
        buttonLabel : 'Save',

        properties: ['createDirectory', 'showOverwriteConfirmation'],

        filters : [
          {name: 'csv', extensions: ['csv', ]},
          {name: 'All Files', extensions: ['*']}
        ]
      }
    };

    this._ipc.runCommand('open-system-dialog', null, options).pipe(
      take(1),
      concatMap(path => iif(
        () => (typeof path === 'string') && (path.length > 0),
        defer(() => {
          const orders = this.filteredOrderIdxs.map(idx => {

            const exportOrder: ExportSellOrderItem = {
              orderId: 0,
              orderItemId: 0,
              orderHash: '',
              orderCurrentStatusLabel: '',
              orderCurrentStatusId: '',
              orderIsFinalized: null,
              marketKey: '',
              timestampCreated: 0,
              timestampUpdated: 0,
              listingId: 0,
              listingTitle: '',
              listingHash: '',
              priceItem: '',
              priceShipping: '',
              priceSellerEscrow: '',
              priceSaleValue: '',
              shippingName: '',
              shippingAddress: '',
              noteBuyerEscrow: '',
              noteBuyerRelease: '',
              txnRelease: '',
              txnEscrow: '',
            };

            const order = this.ordersList[idx];
            if (order) {
              exportOrder.orderId = order.orderId;
              exportOrder.orderItemId = order.orderItemId;
              exportOrder.orderHash = order.orderHash;
              exportOrder.marketKey = order.marketKey;
              if (order.currentState) {
                exportOrder.orderIsFinalized = order.currentState.state.isFinalState;
                exportOrder.orderCurrentStatusLabel = order.currentState.state.label;
                exportOrder.orderCurrentStatusId = order.currentState.state.stateId;
              }
              exportOrder.marketKey = order.marketKey;
              exportOrder.timestampCreated = order.created;
              exportOrder.timestampUpdated = order.updated;

              if (order.listing) {
                exportOrder.listingId = order.listing.id;
                exportOrder.listingTitle = order.listing.title;
                exportOrder.listingHash = order.listing.hash + '"blahblah blah"';
              }

              if (order.pricing) {
                exportOrder.priceItem = `${order.pricing.basePrice.whole}${order.pricing.basePrice.sep}${order.pricing.basePrice.fraction}`;
                exportOrder.priceShipping = `${order.pricing.shippingPrice.whole}${order.pricing.shippingPrice.sep}${order.pricing.shippingPrice.fraction}`;
                exportOrder.priceSellerEscrow = `${order.pricing.escrowAmount.whole}${order.pricing.escrowAmount.sep}${order.pricing.escrowAmount.fraction}`;
                exportOrder.priceSaleValue = `${order.pricing.subTotal.whole}${order.pricing.subTotal.sep}${order.pricing.subTotal.fraction}`;
              }

              if (order.shippingDetails) {
                exportOrder.shippingName = order.shippingDetails.name;
                const addressParts = [
                  order.shippingDetails.addressLine1,
                ];
                if (order.shippingDetails.addressLine2) {
                  addressParts.push(order.shippingDetails.addressLine2);
                }
                addressParts.push(
                  order.shippingDetails.city,
                  order.shippingDetails.state,
                  order.shippingDetails.country,
                  order.shippingDetails.code
                );
                exportOrder.shippingAddress = addressParts.join(' ; ');
              }
              if (order.extraDetails) {
                exportOrder.noteBuyerEscrow = order.extraDetails.escrowMemo || '';
                exportOrder.noteBuyerRelease = order.extraDetails.releaseMemo || '';
                exportOrder.txnEscrow = order.extraDetails.escrowTxn || '';
                exportOrder.txnRelease = order.extraDetails.releaseTxn || '';
              }
            }

            return exportOrder;
          }).filter(order => +order.orderId > 0);

          return this._ipc.runCommand('market-export-writecsv', null, path, orders);
        })
      ))
    ).subscribe(
      () => this._snackbar.open(TextContent.CSV_EXPORTED_SUCCESS),
      (err) => this._snackbar.open(TextContent.CSV_EXPORTED_ERROR.replace('${reason}', err))
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
