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
  listing_filtering: Array<any> = [
    { title: 'All listings', value: 'all',         amount: '5' },
    { title: 'Unpublished',  value: 'unpublished', amount: '1' }, // all unpublished = pending (?), sold & expired
    { title: 'Pending',      value: 'pending',     amount: '1' },
    { title: 'Listed',       value: 'listed',      amount: '2' },
    { title: 'Sold',         value: 'sold',        amount: '1' },
    { title: 'Expired',      value: 'expired',     amount: '0' }
  ];

  // TODO: disable radios for 0 amount-statuses
  order_filtering: Array<any> = [
    { title: 'All orders', value: 'all',     amount: '3' },
    { title: 'Bidding',    value: 'bidding', amount: '1' },
    { title: 'In escrow',  value: 'escrow',  amount: '0' },
    { title: 'Shipped',    value: 'shipped', amount: '1' },
    { title: 'Sold',       value: 'sold',    amount: '1' }
  ];

  listings: Array<any> = [
    {
      name: 'My basic listing template',
      category: 'Electronics, DIY',
      status: 'unpublished',
      status_info: 'Inactive, unpublished listing template – used to tweak your listing before publishing (or after you take down your active listings later)',
      action_icon: 'part-check',
      action_button: 'Publish',
      action_tooltip: 'Activate listing and put it on sale',
      action_color: 'primary'
    },
    {
      name: 'Fresh product (2 kg)',
      category: 'Food, Cosmetics',
      status: 'pending',
      status_info: 'Listing successfully created and paid, waiting to be published on the market (usually needs XX confirmations before going live)',
      action_icon: 'part-date',
      action_button: 'Waiting for publication', // TODO: disable this button
      action_tooltip: 'Awaiting confirmations before making the listing live',
      action_color: 'primary'
    },
    {
      name: 'The most delicious Particl-branded cupcakes',
      category: 'Munchies',
      status: 'listed',
      status_info: 'Active, published listing visible on the market – available for purchase',
      action_icon: 'part-error',
      action_button: 'Unpublish',
      action_tooltip: 'Take the listing off market',
      action_color: 'warn'
    },
    {
      name: 'NFC-enabled contactless payment perfume',
      category: 'Toys for girls',
      status: 'expired',
      status_info: 'Expired, inactive listing – can be relisted on the market again after payment of listing fee',
      action_icon: 'part-check',
      action_button: 'Publish again',
      action_tooltip: 'Re-list expired listing on the market',
      action_color: 'primary'
    },
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
