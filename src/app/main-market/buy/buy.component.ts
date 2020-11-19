import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { map, tap, takeUntil } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';


interface BuyTab {
  icon: string;
  title: string;
  templ: string;
  notificationValue: any;
}


@Component({
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyComponent implements OnInit, OnDestroy {

  readonly tabs: BuyTab[] = [
    { title: 'Buy Orders', icon: 'part-recipe', templ: 'orders', notificationValue: null},
    // { title: 'Answers', icon: 'part-chat-discussion', templ: 'comments', notificationValue: null},
    { title: 'Shipping profiles', icon: 'part-truck', templ: 'shipping-profiles', notificationValue: null},
  ];


  private selectedTabIdx: number = 0;
  private destroy$: Subject<void> = new Subject();


  constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef,
    private _store: Store
  ) { }


  ngOnInit() {
    merge(
      this._route.queryParams.pipe(
        map(params => params['selectedBuyTab']),
        tap((selectedBuyTab: string | undefined) => {
          if (selectedBuyTab) {
            const newTabIdx = this.tabs.findIndex(tab => tab.templ === selectedBuyTab);
            if (newTabIdx > -1) {
              this.selectedTabIdx = newTabIdx;
            }
            this._cdr.detectChanges();
          }
        }),
        takeUntil(this.destroy$)
      ),

      this._store.select(MarketState.orderCountNotification('buy')).pipe(
        tap((value) => {
          const ordersTab = this.tabs.find(t => t.templ === 'orders');
          if (ordersTab) {
            ordersTab.notificationValue = +value > 0 ? +value : null;
          }
        }),
        takeUntil(this.destroy$)
      ),
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
