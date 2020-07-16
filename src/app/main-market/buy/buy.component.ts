import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


interface BuyTab {
  icon: string;
  title: string;
  templ: string;
}


@Component({
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyComponent implements OnInit {

  readonly tabs: BuyTab[] = [
    { title: 'Buy Orders', icon: 'part-recipe', templ: 'orders'},
    { title: 'Answers', icon: 'part-chat-discussion', templ: 'comments'},
    { title: 'Favourites', icon: 'part-heart-outline', templ: 'favourites'},
    { title: 'Shipping profiles', icon: 'part-truck', templ: 'shipping-profiles'},
  ];


  private selectedTabIdx: number = 0;


  constructor(
    private _route: ActivatedRoute
  ) { }


  ngOnInit() {
    const query = this._route.snapshot.queryParams;
    const selectedSellTab = query['selectedBuyTab'];
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
