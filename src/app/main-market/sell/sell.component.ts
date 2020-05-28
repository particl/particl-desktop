import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


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
export class SellComponent implements OnInit {

  readonly tabs: SellTab[] = [
    { title: 'Sell Orders', icon: 'part-recipe', templ: 'orders'},
    { title: 'Products & Listings', icon: 'part-stock', templ: 'templates'},
    { title: 'Questions', icon: 'part-chat-discussion', templ: 'questions'},
  ];


  private selectedTabIdx: number = 0;


  constructor(
    private _route: ActivatedRoute
  ) { }


  ngOnInit() {
    const query = this._route.snapshot.queryParams;
    const selectedSellTab = query['selectedSellTab'];
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
