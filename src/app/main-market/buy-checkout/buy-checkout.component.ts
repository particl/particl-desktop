import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { tap, takeUntil } from 'rxjs/operators';


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
export class BuyCheckoutComponent implements OnInit, OnDestroy {

  readonly tabs: BuyCheckoutTab[] = [
    { title: 'Cart', icon: 'part-cart-2', templ: 'cart', notificationValue: null},
    { title: 'Favourites', icon: 'part-heart-outline', templ: 'favourites', notificationValue: null},
  ];


  private destroy$: Subject<void> = new Subject();
  private selectedTabIdx: number = 0;

  constructor(
    private _route: ActivatedRoute,
    private _store: Store,
  ) { }

  ngOnInit() {
    const query = this._route.snapshot.queryParams;
    const selectedSellTab = query['selectedTab'];
    const newTabIdx = this.tabs.findIndex(tab => tab.templ === selectedSellTab);
    if (newTabIdx > -1) {
      this.selectedTabIdx = newTabIdx;
    }

    this._store.select(MarketState.notificationValue('identityCartItemCount')).pipe(
      tap((cartCountValue) => {
        const cartTab = this.tabs.find(t => t.templ === 'cart');
        if (cartTab) {
          cartTab.notificationValue = +cartCountValue > 0 ? +cartCountValue : null;
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
