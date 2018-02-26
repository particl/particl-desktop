import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';

import { DeleteListingComponent } from '../../modals/delete-listing/delete-listing.component';
import { TemplateService } from 'app/core/market/api/template/template.service';

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
      status_info: 'Inactive, unpublished listing template – used to tweak your listing before publishing'
                  + '(or after you take down your active listings later)',
      action_icon: 'part-check',
      action_button: 'Publish',
      action_tooltip: 'Activate listing and put it on sale',
      action_color: 'primary',
      action_disabled: false
    },
    {
      name: 'Fresh product (2 kg)',
      category: 'Food, Cosmetics',
      status: 'pending',
      status_info: 'Listing successfully created and paid, waiting to be published on the market '
                  + '(usually needs XX confirmations before going live)',
      action_icon: 'part-date',
      action_button: 'Waiting for publication', // TODO: disable this button
      action_tooltip: 'Awaiting confirmations before making the listing live',
      action_color: 'primary',
      action_disabled: true
    },
    {
      name: 'The most delicious Particl-branded cupcakes',
      category: 'Munchies',
      status: 'listed',
      status_info: 'Active, published listing visible on the market – available for purchase',
      action_icon: 'part-error',
      action_button: 'Unpublish',
      action_tooltip: 'Take the listing off market',
      action_color: 'warn',
      action_disabled: false
    },
    {
      name: 'NFC-enabled contactless payment perfume',
      category: 'Toys for girls',
      status: 'expired',
      status_info: 'Expired, inactive listing – can be relisted on the market again after payment of listing fee',
      action_icon: 'part-check',
      action_button: 'Publish again',
      action_tooltip: 'Re-list expired listing on the market',
      action_color: 'primary',
      action_disabled: false
    },
  ];

  orders: Array<any> = [
    {
      name: 'NFC-enabled contactless payment perfume',
      hash: 'AGR', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg6', // TODO: assign random hash_bg (bg1-bg16)
      status: 'bidding',
      status_info: 'Buyer wants to purchase this item – Approve or reject this order to continue',
      action_icon: 'part-check',
      action_button: 'Accept bid',
      action_tooltip: 'Approve this order and sell to this buyer',
      action_disabled: false
    },
    {
      name: 'My basic listing template',
      hash: '5EH', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg2', // TODO: assign random hash_bg (bg1-bg16)
      status: 'escrow',
      status_info: 'Buyer\'s funds are locked in escrow, order is ready to ship – when sent,'
                  + ' mark order as shipped and await its delivery',
      action_icon: 'part-check',
      action_button: 'Mark as shipped',
      action_tooltip: 'Confirm that the order has been shipped to buyer',
      action_disabled: false
    },
    {
      name: 'Fresh product (2 kg)',
      hash: 'SPP', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg11', // TODO: assign random hash_bg (bg1-bg16)
      status: 'shipping',
      status_info: 'Order sent to buyer, waiting for buyer to confirm the delivery',
      action_icon: 'part-date',
      action_button: 'Waiting for delivery',
      action_tooltip: 'Awaiting confirmation of successfull delivery by Buyer',
      action_disabled: true
    },
    {
      name: 'Fresh product (2 kg)',
      hash: '1ER', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg8', // TODO: assign random hash_bg (bg1-bg16)
      status: 'sold',
      status_info: 'Order delivery confirmed by buyer – awaiting Buyer\'s feedback',
      action_icon: 'part-date',
      action_button: 'Waiting for feedback',
      action_tooltip: 'Awaiting buyer\'s feedback on the order',
      action_disabled: true
    },
  ];

  filters: any = {
    search:   undefined,
    sort:     undefined,
    status:   undefined
  };

  public templates: Array<any>;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private template: TemplateService) {}

  ngOnInit() {
    this.update();
  }

  addItem(id?: number, clone?: boolean) {
    this.router.navigate(['/market/template'], { queryParams: {'id': id, 'clone': clone } });
  }

  clear(): void {
    this.filters();
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  confirmDeleteListing(id: number): void {
    const dialogRef = this.dialog.open(DeleteListingComponent);
  }

  update() {
    this.template.search(1, 10, 1).subscribe(
      (templates: Array<any>) => {
        this.templates = templates;
      }
    )
  }

}
