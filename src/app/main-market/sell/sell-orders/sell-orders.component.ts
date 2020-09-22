import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Observable, Subject, of, merge, defer, throwError } from 'rxjs';
import { takeUntil, tap, map, switchMap, catchError, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';
import { WalletInfoState } from 'app/main/store/main.state';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { BidOrderService } from '../../services/orders/orders.service';
import { DataService } from '../../services/data/data.service';
import { ListingDetailModalComponent } from '../../shared/listing-detail-modal/listing-detail-modal.component';

import { WalletInfoStateModel } from 'app/main/store/main.models';
import { OrderItem, BuyFlowOrderType, OrderUserType } from '../../services/orders/orders.models';
import { Identity } from '../../store/market.models';


enum TextContent {
  LOADING_ERROR = 'Failed to load orders correctly',
  FILTER_LABEL_ALL_ORDERS = 'All Items',
  ORDER_UPDATE_ERROR = 'Order update failed'
}

interface BuyflowStep {
  value: BuyFlowOrderType;
  title: string;
}


@Component({
  selector: 'market-sell-orders',
  templateUrl: './sell-orders.component.html',
  styleUrls: ['./sell-orders.component.scss']
})
export class SellOrdersComponent implements OnInit, OnDestroy {

  identityIsEncrypted: boolean = false;
  isLoading: boolean = true;

  querySearch: FormControl = new FormControl('');
  queryFilterAttention: FormControl = new FormControl(false);
  queryFilterComplete: FormControl = new FormControl(false);
  queryFilterMarket: FormControl = new FormControl('');
  queryFilterStatus: FormControl = new FormControl('');

  filterOptionsMarkets: {[marketKey: string]: string } = {};
  filterOptionsStatus: {value: BuyFlowOrderType | '', title: string, count: number}[] = [];

  happyBuyflow: { steps: BuyflowStep[], stateLookup: {[state in BuyFlowOrderType]?: number} } = {
    steps: [],
    stateLookup: {},
  };

  filteredOrderIdxs: number[] = [];
  ordersList: OrderItem[] = [];


  private readonly viewer: OrderUserType = 'SELLER';
  private destroy$: Subject<void> = new Subject();
  private currentIdentity: Identity = null;
  private loadOrdersControl: FormControl = new FormControl(true);
  private loadMarketsControl: FormControl = new FormControl();
  private renderOrdersControl: FormControl = new FormControl();


  constructor(
    private _store: Store,
    private _cdr: ChangeDetectorRef,
    private _orderService: BidOrderService,
    private _sharedService: DataService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) {
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

    const orderLoader$ = this.loadOrdersControl.valueChanges.pipe(
      tap((doClear: boolean) => {
        this.isLoading = true;

        if (!!doClear) {
          this.filteredOrderIdxs = [];
          this.ordersList = [];
          this.filterOptionsStatus.forEach(s => s.count = 0);
        }

        this._cdr.detectChanges();

      }),
      switchMap(() => this.fetchOrders().pipe(
        tap(orders => {
          const isInit = this.ordersList.length === 0;

          if (isInit) {
            this.ordersList.push(...orders);
          }

          orders.forEach(newOrder => {
            // update filter counts
            const optionAll = this.filterOptionsStatus.find(s => s.value === '');
            if (optionAll) {
              optionAll.count++;
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

          this.isLoading = false;
          this.renderOrdersControl.setValue(null);
          this._cdr.detectChanges();
        }),
      )),
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


    // TODO: On incoming message updates, check that the message market is current and do a reload of orders


    merge(
      identityChange$,
      marketLoader$,
      orderLoader$,
      updateDisplay$,
      filterChange$
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
    this.queryFilterComplete.setValue(false, {emitEvent: false});
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


  executeAction(orderItem: OrderItem, moveToState: BuyFlowOrderType): void {
    this._orderService.actionOrderItem(orderItem, moveToState, this.viewer).subscribe(
      (newItem) => {
        if (
          (orderItem.orderId === newItem.orderId) &&
          (orderItem.currentState.state.stateId !== newItem.currentState.state.stateId)
        ) {
          const foundOrderIdx = this.ordersList.findIndex(o => o.orderId === orderItem.orderId);
          if (foundOrderIdx > -1) {
            this.ordersList[foundOrderIdx] = newItem;
          }
        }
      },
      (err) => this._snackbar.open(TextContent.ORDER_UPDATE_ERROR, 'err')
    );
  }


  private fetchOrders(): Observable<OrderItem[]> {
    if (!this.currentIdentity || !this.currentIdentity.address) {
      return of([] as OrderItem[]);
    }

    let obs$ = this._orderService.fetchBids(this.viewer);
    if (Object.keys(this.filterOptionsMarkets).length === 0) {
      obs$ = throwError('Market Load Error');
    }

    return obs$.pipe(
      catchError(() => {
        this._snackbar.open(TextContent.LOADING_ERROR, 'warn');
        return of([]);
      })
    );
  }


  private fetchMarkets(): Observable<{ key: string; name: string; }[]> {
    if (!this.currentIdentity || !(+this.currentIdentity.id > 0)) {
      return of([]);
    }
    return this._sharedService.loadMarkets(this.currentIdentity.id).pipe(
      map(markets => {
        return markets.map(m => ({key: m.publishAddress, name: m.name}));
      }),
      catchError(() => of([]))
    );
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
              (!showComplete ?
                (order.currentState.actions.PRIMARY.length > 0) || (order.currentState.actions.ALTERNATIVE.length > 0) : true
              )
            );

        if (addItem) {
          idxList.push(orderIdx);
        }
      });

      return of(idxList);
    });
  }

}
