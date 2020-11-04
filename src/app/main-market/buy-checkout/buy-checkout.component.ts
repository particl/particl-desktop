import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


interface BuyCheckoutTab {
  icon: string;
  title: string;
  templ: string;
  notificationValue: any;
}

@Component({
  templateUrl: './buy-checkout.component.html',
  styleUrls: ['./buy-checkout.component.scss']
})
export class BuyCheckoutComponent implements OnInit {

  readonly tabs: BuyCheckoutTab[] = [
    { title: 'Your Cart', icon: 'part-cart-2', templ: 'cart', notificationValue: null},
    { title: 'Favourites', icon: 'part-heart-outline', templ: 'favourites', notificationValue: null},
  ];

  private selectedTabIdx: number = 0;

  constructor(
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

}
