import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';

import { BidService } from 'app/core/market/api/bid/bid.service';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { OrderFilter } from './order-filter.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { take, takeWhile, map } from 'rxjs/operators';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';

/*
  TODO (zaSmilingIdiot 2019-06-13):
  It is overtly difficult to reason about any of this component's state at any given time. There's far too much
    potentially changing state at any point in time. This smells like a bad architectural setup. Or wait...
  I've updated it to to at least function slightly better, but even this is more a bandaid:
    the bandaid needs to be replaced with a bandage, and then the whole component, services, child-components, etc
    needs to be replaced. With a proper implementation.
  A proper implementation should consider that bid lists of length 100, 1000 or even 10000 may be returned.
    (consider a seller with 10 items, and 100 bids received per item as a simple example).
  Probably should do this over. Paginated results, not yanking the current expanded order item out from underneath the user
    while they are busy looking at it, just because the orders updated. Stupid things like this can be done alot better...
*/

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
  private isProcessing: boolean = false;
  private request$: Subscription;

  filters: any = {
    status: '*',
    search: '',
  };
  additionalFilter: any = {
    requiredAttention: false,
    hideCompleted: false
  };
  private destroyed: boolean = false;

  constructor(
    private bidService: BidService,
    private dialog: MatDialog,
    private profileService: ProfileService,
    private _marketState: MarketStateService) { }

  ngOnInit() {
    this.profileService.default().pipe(
      take(1)
    ).subscribe(
      profile => {
        this.profile = profile;
      },
      () => {},
      () => {
        this._marketState.observe('bid')
        .pipe(
          takeWhile(() => !this.destroyed),
          map((bids) => this.extractTypedBids(bids))
        )
        .subscribe( (bids) => {
          bids = this.doAdditionalBidFiltering(bids);
          if (!this.isProcessing && this.hasUpdatedOrders(bids)) {
            this.updateOrders(false);
          }
        });
      }
    );
  }

  get isFilteringExtra(): boolean {
    return Object.getOwnPropertyNames(this.additionalFilter).filter(key => this.additionalFilter[key] === true).length > 0;
  }

  private extractTypedBids(bids: Bid[]): Bid[] {
    const actualBids: Bid[] = [];
    for (let ii = bids.length - 1; ii >= 0; --ii) {
      if (!this.isOfCurrentType(bids[ii]) || bids[ii].type !== 'MPA_BID') {
        continue;
      }
      actualBids.push(new Bid(bids[ii], this.type));
    }
    return actualBids;
  }

  private updateOrders(showModal: boolean = true) {
    this.isProcessing = true;
    const searchStr = String(this.filters.search);
    const statusStr = String(this.filters.status);

    if (showModal) {
      this.openProcessingModal();
    }

    if (this.request$ && !this.request$.closed) {
      this.request$.unsubscribe();
    }
    this.request$ = this.bidService.search('MPA_BID', searchStr)
      .pipe(
        take(1),
        map((bids: Bid[]) => this.extractTypedBids(bids)),
        map( (bids: Bid[]) => {
          const orderFilter = this.order_filters.filters.find((f) => f.value === statusStr);
          if (orderFilter) {
            const filterValue = orderFilter.filter;
            if (statusStr === (this.order_filters.filters[0] || {}).value) {
              return bids;
            }

            return bids.filter((bid) => bid.allStatus === filterValue);
          }
          return [];
        })
      ).subscribe(
        (bids) => {
          const totalCount = bids.length;
          // additional filtering here:
          bids = this.doAdditionalBidFiltering(bids);
          // Only update if needed
          if (this.hasUpdatedOrders(bids)) {
            this.order_filters = new OrderFilter(bids);
            this.orders = bids;
          }
        },
        () => {},
        () => {
          this.dialog.closeAll();
          this.isProcessing = false;
        }
      );
  }

  private doAdditionalBidFiltering(bids: Bid[]): Bid[] {
    let filteredBids: Bid[];
    if (this.isFilteringExtra) {
      filteredBids = bids.filter(
        (bid) => {
          return (this.additionalFilter.hideCompleted ? bid.step !== 'complete' : true) &&
                  (this.additionalFilter.requiredAttention ? bid.activeBuySell : true)
          }
      );
    } else {
      filteredBids = bids;
    }
    return filteredBids;
  }

  private openProcessingModal() {
    this.dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Please wait while your items are updated'
      }
    });
  }

  private hasUpdatedOrders(newOrders: Bid[]): boolean {
    const newFilters = new OrderFilter(newOrders);
    const filterKeys = Object.keys(newFilters.filters);

    let isDifferent = false;
    for (const key of filterKeys) {
      if (newFilters.filters[key].count !== this.order_filters.filters[key].count) {
        isDifferent = true;
        break;
      }
    }

    return isDifferent;
  }

  private isOfCurrentType(bid: any): boolean {
    return (this.type === 'sell' && bid.ListingItem && bid.ListingItem.seller  === this.profile.address) ||
      (this.type === 'buy' && bid.bidder === this.profile.address);
  }

  loadOrders () {
    this.updateOrders(true);
  }

  orderItemUpdated(update: any) {
    this.updateOrders(true);
  }

  clearAllFilters(): void {
    this.filters.status = '*';
    this.filters.search = '';
    this.additionalFilter.requiredAttention = false;
    this.additionalFilter.hideCompleted = false;
    this.updateOrders(true);
  }

  ngOnDestroy() {
    this.destroyed = true;
    try {
      this.request$.unsubscribe();
    } catch (err) {}
  }
}
