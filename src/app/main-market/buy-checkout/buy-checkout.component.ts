import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

import { ListingDetailModalComponent } from '../shared/listing-detail-modal/listing-detail-modal.component';
import { PlaceBidModalComponent } from './place-bid-modal/place-bid-modal.component';


interface BuyCheckoutTab {
  icon: string;
  title: string;
  templ: string;
}

@Component({
  selector: 'market-buy-checkout',
  templateUrl: './buy-checkout.component.html',
  styleUrls: ['./buy-checkout.component.scss']
})
export class BuyCheckoutComponent implements OnInit {

  readonly tabs: BuyCheckoutTab[] = [
    { title: 'Your Cart', icon: 'part-cart-2', templ: 'cart'},
    { title: 'Favourites', icon: 'part-heart-outline', templ: 'favourites'},
  ];

  private selectedTabIdx: number = 0;

  saveShippingProfile: boolean = false;

  constructor(
    private _dialog: MatDialog,
    private _route: ActivatedRoute
  ) { }

  ngOnInit() {
    const query = this._route.snapshot.queryParams;
    const selectedSellTab = query['selectedTab'];
    const newTabIdx = this.tabs.findIndex(tab => tab.templ === selectedSellTab);
    if (newTabIdx > -1) {
      this.selectedTabIdx = newTabIdx;
    }
  }

  get selectedTab(): number {
    return this.selectedTabIdx;
  }

  get selectedTempl(): string {
    return this.tabs[this.selectedTabIdx].templ;
  }


  changeTab(idx: number) {
    if ((idx !== this.selectedTabIdx) && (idx >= 0) && (idx < this.tabs.length)) {
      this.selectedTabIdx = idx;
    }
  }

  openListingDetailModal(): void {
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }

  openPlaceBidModal(): void {
    const dialog = this._dialog.open(PlaceBidModalComponent);
  }

}
