import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

import { BidService } from 'app/core/market/api/bid/bid.service';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { OrderFilter } from './order-filter.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { take, takeWhile, map, filter } from 'rxjs/operators';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';

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
          console.log('@@@@@ processed Bids from source: ', bids);
          const newFilters = new OrderFilter(bids);
          const filterKeys = Object.keys(newFilters.filters);
          let doUpdate = false;
          for (const key of filterKeys) {
            if (newFilters.filters[key].count !== this.order_filters.filters[key].count) {
              doUpdate = true;
              break;
            }
          }

          if (doUpdate) {
            console.log('@@@@@ needing to update orders');
            this.order_filters = newFilters;
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
      if (!this.isOfCurrentType(bids[ii])) {
        continue;
      }
      actualBids.push(new Bid(bids[ii], this.type));
    }
    return actualBids;
  }

  private updateOrders(showModal: boolean = true) {
    if (showModal) {
      this.openProcessingModal();
    }
    const searchStr = String(this.filters.search);
    const statusStr = String(this.filters.status);
    this.bidService.search('MPA_BID', searchStr)
      .pipe(
        take(1),
        map((bids: Bid[]) => this.extractTypedBids(bids)),
        map( (bids: Bid[]) => {
          const orderFilter = this.order_filters.filters.find((f) => f.value === statusStr);
          if (orderFilter) {
            const filterValue = orderFilter.filter;
            if (statusStr === '*') {
              return bids;
            }

            return bids.filter((bid) => bid.allStatus === filterValue);
          }
          return [];
        })
      )
      .subscribe(
        (bids) => {
          console.log('@@@@@@@@@ updateOrders List received:', bids);
          const totalCount = bids.length;
          // additional filtering here:
          if (this.isFilteringExtra) {
            bids = bids.filter(
              (bid) => {
                return (this.additionalFilter.hideCompleted ? bid.step !== 'complete' : true) &&
                        (this.additionalFilter.requiredAttention ? bid.activeBuySell : true)
                }
            );
          }
          // Only update if needed
          if (this.hasUpdatedOrders(bids)) {
            this.order_filters.setFilterCount(statusStr, totalCount);
            this.orders = bids;
          }
        },
        () => {},
        () => {
          this.dialog.closeAll();
        }
      );
  }

  private openProcessingModal() {
    this.dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Please wait while we filter your items'
      }
    });
  }

  private hasUpdatedOrders(newOrders: Bid[]): boolean {
    return (
      !this.orders ||
      (this.orders.length !== newOrders.length) ||
      (_.differenceWith(this.orders, newOrders, (o1, o2) => {
        return (o1.id === o2.id) && (o1.allStatus === o2.allStatus)
      }).length)
    )
  }

  private isOfCurrentType(bid: any): boolean {
    return (this.type === 'sell' && bid.ListingItem && bid.ListingItem.seller  === this.profile.address) ||
      (this.type === 'buy' && bid.bidder === this.profile.address);
  }

  loadOrders () {
    this.updateOrders(true);
  }

  orderItemUpdated(update: any) {
    console.log('@@@@@@ PROCESSING ORDER ITEM UPDATE EVENT');
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
  }
}
