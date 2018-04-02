import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { DeleteListingComponent } from '../../modals/delete-listing/delete-listing.component';
import { TemplateService } from 'app/core/market/api/template/template.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Template } from 'app/core/market/api/template/template.model';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { ModalsService } from 'app/modals/modals.service';
import { Status } from './status.class';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent implements OnInit {
  public status: Status = new Status();

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['listings', 'orders', 'sell_item']; // FIXME: remove sell_item and leave as a separate page?

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
    private listing: ListingService,
    private rpcState: RpcStateService,
    private modals: ModalsService,
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
        console.log(listings);
        this.listings = listings;
      }
    )
  }

  // Triggered when the action button is clicked.
  action(listing: any) {
    switch (listing.status) {
      case 'unpublished':
        this.postTemplate(listing.id);
        break;
      case 'published':
        break;
    }
  }

  postTemplate(id: any) {
    if (this.rpcState.get('locked')) {
      this.modals.open('unlock', {forceOpen: true, timeout: 30, callback: this.callTemplate.bind(this, id)});
    } else {
      this.callTemplate(id);
    }
  }

  callTemplate(id: any) {
    this.template.post(id, 1).take(1).subscribe(listing => {
        console.log(listing);
      });
  }

  getStatus(status: string) {
    return [this.status.get(status)];
  }
}
