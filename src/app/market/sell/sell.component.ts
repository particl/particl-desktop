import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { DeleteListingComponent } from '../../modals/delete-listing/delete-listing.component';
import { TemplateService } from 'app/core/market/api/template/template.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Template } from 'app/core/market/api/template/template.model';

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

  listingssample: Array<any> = [
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
      status_info: 'Buyer wants to purchase this item – accept or reject this bid to continue',
      action_icon: 'part-check',
      action_button: 'Accept bid',
      action_tooltip: 'Approve this order and sell to this buyer',
      action_disabled: false,
      allow_reject_order: true,
      show_escrow_txdetails: false,
    },
    {
      name: 'Development Buff (2 week subscription)',
      hash: 'FG2', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg12', // TODO: assign random hash_bg (bg1-bg16)
      status: 'awaiting',
      status_info: 'Waiting for Buyer to lock the payment into escrow',
      action_icon: 'part-date',
      action_button: 'Waiting for buyer',
      action_tooltip: 'Waiting for buyer\'s payment',
      action_disabled: true,
      allow_reject_order: false,
      show_escrow_txdetails: false,
    },
    {
      name: 'Development Buff (2 week subscription)',
      hash: 'FG2', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg12', // TODO: assign random hash_bg (bg1-bg16)
      status: 'awaiting',
      status_info: '????',
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
                  + ' mark order as shipped, await its delivery and release of funds from escrow',
      action_icon: 'part-check',
      action_button: 'Mark as shipped',
      action_tooltip: 'Confirm that the order has been shipped to Buyer',
      action_disabled: false,
      allow_reject_order: false,
      show_escrow_txdetails: true,
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
      action_disabled: true,
      allow_reject_order: false,
      show_escrow_txdetails: true,
    },
    {
      name: 'Fresh product (2 kg)',
      hash: '1ER', // TODO: randomized string (maybe first letters of TX ID) for quick order ID
      hash_bg: 'bg8', // TODO: assign random hash_bg (bg1-bg16)
      status: 'complete',
      status_info: 'Order delivery confirmed by Buyer – order successfully finalized',
      action_icon: 'part-check',
      action_button: 'Order complete',
      action_tooltip: '',
      action_disabled: true,
      allow_reject_order: false,
      show_escrow_txdetails: true,
    },
  ];

  filters: any = {
    search:   undefined,
    sort:     undefined,
    status:   undefined
  };

  public listings: Array<any>;

  public search: string = '';
  public category: string = '';

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private template: TemplateService,
    private listing: ListingService
  ) {}

  ngOnInit() {
    this.loadPage();
  }

  addItem(id?: number, clone?: boolean) {
    this.router.navigate(['/market/template'], {
      queryParams: {'id': id, 'clone': clone }
    });
  }

  clear(): void {
    this.filters = {
      search:   undefined,
      sort:     undefined,
      status:   undefined
    };
    this.loadPage();
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  confirmDeleteListing(template: Template): void {
    const dialogRef = this.dialog.open(DeleteListingComponent);
    dialogRef.componentInstance.templateToRemove = template;
    dialogRef.afterClosed().subscribe(
      () => this.loadPage()
    );
  }

  loadPage() {
    const category = this.filters.category ? this.filters.category : null;
    const search = this.filters.search ? this.filters.search : null;
    this.template.search(1, 10, 1, category, search).subscribe(
      (listings: Array<Template>) => {
        console.log('got templates');
        console.log(listings);
        this.listings = listings;
      }
    )
  }

}
