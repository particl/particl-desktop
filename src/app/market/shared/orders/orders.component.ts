import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable, interval } from 'rxjs';
import * as _ from 'lodash';

import { BidService } from 'app/core/market/api/bid/bid.service';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { OrderFilter } from './order-filter.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { take, takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {

  private log: any = Log.create('orders.component id:' + Math.floor((Math.random() * 1000) + 1));
  @Input() type: string;

  order_sortings: Array<any> = [
    { title: 'By creation date', value: 'date-created'  },
    { title: 'By update date',   value: 'date-update'   },
    { title: 'By status',        value: 'status'        },
    { title: 'By item name',     value: 'item-name'     },
    { title: 'By category',      value: 'category'      },
    { title: 'By quantity',      value: 'quantity'      },
    { title: 'By price',         value: 'price'         }
  ];

  public orders: Bid[];
  public profile: any = {};
  order_filters: OrderFilter;

  filters: any;
  additionalFilter: any;
  timer: Observable<number>;
  destroyed: boolean = false;

  constructor(
    private bid: BidService,
    private profileService: ProfileService) { }

  ngOnInit() {
    this.default();
    this.loadProfile();
  }

  default(): void {
    this.filters = {
      status: '*',
      search: '',
      sort: 'time',
    };

    this.additionalFilter = {
      requiredAttention: false,
      hideCompleted: false
    }
  }

  loadProfile(): void {
    this.profileService.default()
    .pipe(take(1)).subscribe(
      profile => {
        this.profile = profile;
        this.initLoopLoadOrders();
      });
  }

  initLoopLoadOrders() {
    this.loadOrders()
    this.timer = interval(1000 * 10);

    // call loadOrders in every 10 sec.
    this.timer.pipe(takeWhile(() => !this.destroyed)).subscribe((t) => {
      this.loadOrders()
    });
  }

  loadOrders(): void {
    this.bid.search(this.profile.address, this.type, this.filters.status, this.filters.search, this.additionalFilter)
      .pipe(take(1))
      .subscribe(bids => {
        // Only update if needed
        if (this.hasUpdatedOrders(bids.filterOrders)) {
          // Initialize model only when its fetching for all orders.
          if (this.filters.status === '*') {
            this.order_filters = new OrderFilter();
          }
          this.order_filters.setOrderStatusCount(this.filters.status, bids.filterOrders)
          this.orders = bids.filterOrders;
        }
      });
  }

  hasUpdatedOrders(newOrders: Bid[]): boolean {
    return (
      !this.orders ||
      (this.orders.length !== newOrders.length) ||
      (_.differenceWith(this.orders, newOrders, (o1, o2) => {
        return (o1.id === o2.id) && (o1.status === o2.status)
      }).length)
    )
  }

  clear(): void {
    this.default();
    this.loadOrders();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
