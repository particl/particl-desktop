import {Component, Input, OnInit} from '@angular/core';
import { Log } from 'ng2-logger';

import { BidService } from 'app/core/market/api/bid/bid.service';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

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
  orders: Array<Bid> = [];
  public profile: any = {};

  filters: any = {
    search:   undefined,
    sort:     undefined
  };

  constructor(private bid: BidService, private profileService: ProfileService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.get(1).take(1).subscribe(
      profile => {
        this.profile = profile;
        this.loadOrders();
      });
  }
  loadOrders(): void {
    this.bid.search(this.profile.address).subscribe(orders => {
      this.orders = orders;
    });
  }

}
