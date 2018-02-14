import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent implements OnInit {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['listings', 'orders', 'sell_item']; // FIXME: remove sell_item and leave as a separate page?

  listing_sortings: Array<any> = [
    { title: 'By creation date',   value: 'date-created'    },
    { title: 'By expiration date', value: 'date-expiration' },
    { title: 'By item name',       value: 'item-name'       },
    { title: 'By category',        value: 'category'        },
    { title: 'By quantity',        value: 'quantity'        },
    { title: 'By price',           value: 'price'           }
  ];

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
  listing_statuses: Array<any> = [
    { title: 'All listings', value: 'all',         amount: '5' },
    { title: 'Unpublished',  value: 'unpublished', amount: '1' }, // all unpublished = pending (?), sold & expired
    { title: 'Pending',      value: 'pending',     amount: '1' },
    { title: 'Listed',       value: 'listed',      amount: '2' },
    { title: 'Sold',         value: 'sold',        amount: '1' },
    { title: 'Expired',      value: 'expired',     amount: '0' },
  ];

  // TODO: disable radios for 0 amount-statuses
  order_statuses: Array<any> = [
    { title: 'All orders', value: 'all',     amount: '3' },
    { title: 'Bidding',    value: 'bidding', amount: '1' },
    { title: 'In escrow',  value: 'escrow',  amount: '0' },
    { title: 'Shipped',    value: 'shipped', amount: '1' },
    { title: 'Sold',       value: 'sold',    amount: '1' },
  ];

  filters: any = {
    search:   undefined,
    sort:     undefined,
    status:   undefined
  };

  constructor(private router: Router) { }

  ngOnInit() {
  }

  addItem() {
    this.router.navigate(['/market/add-item']);
  }

  clear(): void {
    this.filters();
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

}
