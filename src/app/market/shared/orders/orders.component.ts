import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

import { BidService } from 'app/core/market/api/bid/bid.service';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { OrderFilter } from './order-filter.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { take, takeWhile, map, distinctUntilChanged } from 'rxjs/operators';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {

  private log: any = Log.create('orders.component id:' + Math.floor((Math.random() * 1000) + 1));
  @Input() type: string;

  public orders: Bid[];
  public profile: any = {};
  public order_filters: OrderFilter = new OrderFilter([]);

  filters: any = {
    status: '*',
    search: '',
  };
  additionalFilter: any = {
    requiredAttention: false,
    hideCompleted: false
  };
  timer: Observable<number>;
  destroyed: boolean = false;

  constructor(
    private bid: BidService,
    private profileService: ProfileService,
    private _marketState: MarketStateService) { }

  ngOnInit() {
    this.log.d('@@@@@@ created');

    this.profileService.default().pipe(
      take(1)
    ).subscribe(
      profile => {
        this.log.d('@@@@@@ profile fetched success');
        this.profile = profile;
      },
      () => {},
      () => {
        this.log.d('@@@@@@ init profile fetch complete');
        this._marketState.observe('bid')
        .pipe(takeWhile(() => !this.destroyed))
        .pipe(
          distinctUntilChanged((x, y: any) => _.isEqual(x, y)),
          map((bids) => {
            console.log('@@@@@ init subscription pipe map');
            return this.extractBidsFromSource(bids);
          })
        )
        .subscribe(bids => this.processBids(bids));
      }
    );
  }

  get isFiltering(): boolean {
    return (this.filters.status !== '*') || (this.filters.search !== '');
  }

  get filteredOrders(): Bid[] {
    if (this.additionalFilter.requiredAttention || this.additionalFilter.hideCompleted) {
      return this.orders.filter(order => {
        return (this.additionalFilter.requiredAttention ? order.activeBuySell : false) ||
          (this.additionalFilter.hideCompleted ? order.status !== 'complete' : false);
      });
    }
    return this.orders;
  }

  private processBids(bids: Bid[]) {
    console.log(`@@@@@@@@ Order component: recieved orders from marketState subscription`);
    if (!this.isFiltering && this.hasUpdatedOrders(bids)) {
      this.order_filters = new OrderFilter(bids);
    }
    this.orders = bids;
  }

  private extractBidsFromSource(bids: Bid[]): Bid[] {
    console.log('@@@@@@@@@ extractBidsFromSource GOT BIDS:', bids);
    const actualBids: Bid[] = [];
    bids.forEach(bid => {
      if ( (this.type === 'sell' && bid.ListingItem && bid.ListingItem.seller  === this.profile.address) ||
        (this.type === 'buy' && bid.bidder === this.profile.address) ) {
          actualBids.push(new Bid(bid, this.type));
      }
    })
    console.log('@@@@@@@@@ extractBidsFromSource MAPPED REPONSE:', actualBids);
    return actualBids;
  }

  private hasUpdatedOrders(newOrders: Bid[]): boolean {
    return (
      !this.orders ||
      (this.orders.length !== newOrders.length) ||
      (_.differenceWith(this.orders, newOrders, (o1, o2) => {
        return (o1.id === o2.id) && (o1.status === o2.status)
      }).length)
    )
  }

  loadOrders(): void {
    let observer$: Observable<any>;
    if (this.isFiltering) {
      observer$ = this.bid.search(this.filters.status, this.filters.search)
    } else {
      // Might as well use what is already available, instead of making an additional request
      observer$ = this._marketState.observe('bid')
    }

    observer$.pipe(take(1))
    .pipe(
      map((bids) => this.extractBidsFromSource(bids))
    )
    .subscribe((bids) => this.processBids(bids));
  }

  clearAllFilters(): void {
    this.filters.status = '*';
    this.filters.search = '';
    this.additionalFilter.requiredAttention = false;
    this.additionalFilter.hideCompleted = false;
    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.log.d('@@@@@ destroyed');
  }
}
