import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { map, tap, takeUntil } from 'rxjs/operators';


interface SellTab {
  icon: string;
  title: string;
  templ: string;
}


@Component({
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellComponent implements OnInit, OnDestroy {

  readonly tabs: SellTab[] = [
    { title: 'Sell Orders', icon: 'part-recipe', templ: 'orders'},
    { title: 'Sell Listings', icon: 'part-bag', templ: 'listings'},
    { title: 'Inventory & Products', icon: 'part-stock', templ: 'templates'},
    { title: 'Questions', icon: 'part-chat-discussion', templ: 'questions'},
  ];


  private selectedTabIdx: number = 0;
  private destroy$: Subject<void> = new Subject();


  constructor(
    private _route: ActivatedRoute,
    private _cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {
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
