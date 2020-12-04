import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, merge } from 'rxjs';
import { map, tap, takeUntil } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';


interface SellTab {
  icon: string;
  title: string;
  templ: string;
  notificationValue: any;
}


@Component({
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellComponent implements OnInit, OnDestroy {

  readonly tabs: SellTab[] = [
    { title: 'Orders', icon: 'part-recipe', templ: 'orders', notificationValue: null},
    { title: 'Listings', icon: 'part-bag', templ: 'listings', notificationValue: null},
    { title: 'Inventory & Products', icon: 'part-stock', templ: 'templates', notificationValue: null},
    // { title: 'Questions', icon: 'part-chat-discussion', templ: 'questions', notificationValue: null},
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
        map(params => params['selectedSellTab']),
        tap((selectedSellTab: string | undefined) => {
          if (selectedSellTab) {
            const newTabIdx = this.tabs.findIndex(tab => tab.templ === selectedSellTab);
            if (newTabIdx > -1) {
              this.selectedTabIdx = newTabIdx;
            }
            this._cdr.detectChanges();
          }
        }),
        takeUntil(this.destroy$)
      ),

      this._store.select(MarketState.orderCountNotification('sell')).pipe(
        tap((value) => {
          const ordersTab = this.tabs.find(t => t.templ === 'orders');
          if (ordersTab) {
            ordersTab.notificationValue = +value > 0 ? +value : null;
            this._cdr.detectChanges();
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
