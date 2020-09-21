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
import { OrderItem } from '../../services/orders/orders.models';
import { Identity } from '../../store/market.models';
import { BID_STATUS } from '../../shared/market.models';


enum TextContent {
  LOADING_ERROR = 'Failed to load orders correctly'
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

  // TODO: FIX THIS TO BE GENERIC (REQUESTED FROM SERVICE)
  filterOptionsStatus: {value: BID_STATUS | '', title: string, count: number}[] = [
    { value: '', title: 'All orders', count: 0 },
    { value: BID_STATUS.BID_CREATED, title: 'Bidding', count: 0 },
    { value: BID_STATUS.BID_ACCEPTED, title: 'Awaiting payment', count: 0 },
    { value: BID_STATUS.ESCROW_REQUESTED, title: 'Escrow requested', count: 0 },
    { value: BID_STATUS.ESCROW_COMPLETED, title: 'Packaging', count: 0 },
    { value: BID_STATUS.ITEM_SHIPPED, title: 'Shipping', count: 0 },
    { value: BID_STATUS.COMPLETED, title: 'Completed', count: 0 },
    { value: BID_STATUS.BID_REJECTED, title: 'Rejected', count: 0 },
    { value: BID_STATUS.ORDER_CANCELLED, title: 'Cancelled', count: 0 }
  ];


  filteredOrderIdxs: number[] = [];
  ordersList: OrderItem[] = [];


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
  ) { }


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

          if (markets.length > 0) {
            this.loadOrdersControl.setValue(true);
          }
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
        }

        this._cdr.detectChanges();

      }),
      switchMap(() => this.fetchOrders().pipe(
        tap(orders => {
          this.ordersList.push(...orders);
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

    // TODO: actionables for each order item


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


  private fetchOrders(): Observable<OrderItem[]> {
    if (!this.currentIdentity || !this.currentIdentity.address) {
      return of([] as OrderItem[]);
    }

    let obs$ = this._orderService.fetchBids('SELLER');
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

      // TODO: use other filters (the last 3) - depends on item's current state or actions

      this.ordersList.forEach((order, orderIdx) => {
        const addItem = order.listing.title.toLocaleLowerCase().includes(searchString) &&
            (!filterMarket ? true : order.marketKey === filterMarket);

        if (addItem) {
          idxList.push(orderIdx);
        }
      });

      return of(idxList);
    });
  }

}
