import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs';
import * as _ from 'lodash';

import { BidService } from 'app/core/market/api/bid/bid.service';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';

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

  // TODO: disable radios for 0 amount-statuses
  order_filtering: Array<any> = [
    { title: 'All orders', value: 'all',     amount: '3' },
    { title: 'Bidding',    value: 'bidding', amount: '1' },
    { title: 'In escrow',  value: 'escrow',  amount: '0' },
    { title: 'Shipped',    value: 'shipped', amount: '1' },
    { title: 'Sold',       value: 'sold',    amount: '1' }
  ];
  public orders: Bid[];
  public profile: any = {};

  filters: any = {
    search:   undefined,
    sort:     undefined
  };
  timer: Observable<number>;
  destroyed: boolean = false;

  constructor(
    private bid: BidService,
    private profileService: ProfileService) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.default().take(1).subscribe(
      profile => {
        this.profile = profile;
        this.initLoopLoadOrders();
      });
  }

  initLoopLoadOrders() {
    this.loadOrders()
    this.timer = Observable.interval(1000 * 10);

    // call loadOrders in every 10 sec.
    this.timer.takeWhile(() => !this.destroyed).subscribe((t) => {
      this.loadOrders()
    });
  }

  loadOrders(): void {
    this.bid.search(this.profile.address, this.type)
      .take(1)
      .subscribe(bids => {
        console.log('called >>>>>>>>>>>>>>>>>', bids);
        // reverse the orders
        bids.filterOrders.reverse();

        // Only update if needed
        if (this.hasUpdatedOrders(bids.filterOrders)) {
          this.orders = bids.filterOrders;
        }
      });
  }

  hasUpdatedOrders(newOrders: Bid[]): boolean {
    return (
      !this.orders ||
      (this.orders.length !== newOrders.length) ||
      (_.differenceWith(this.orders, newOrders, (o1, o2) => {
        return (o1.order.id === o2.order.id) && (o1.order['status'] === o2.order['status'])
      }).length)
    )
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
