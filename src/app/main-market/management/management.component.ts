import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


interface MarketManageTab {
  icon: string;
  title: string;
  templ: string;
}


@Component({
  templateUrl: './management.component.html',
  styleUrls: ['./management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementComponent {

  readonly tabs: MarketManageTab[] = [
    { title: 'Your Markets', icon: 'part-shop', templ: 'joined'},
    { title: 'Browser', icon: 'part-globe', templ: 'browser'},
  ];


  private selectedTabIdx: number = 0;


  constructor(
    private _route: ActivatedRoute
  ) {

    const query = this._route.snapshot.queryParams;
    const selectedTab = query['selectedManagementTab'];
    const newTabIdx = this.tabs.findIndex(tab => tab.templ === selectedTab);
    if (newTabIdx > -1) {
      this.selectedTabIdx = newTabIdx;
    }

  }


  get selectedTempl(): string {
    return this.tabs[this.selectedTabIdx].templ;
  }


  get selectedIdx(): number {
    return this.selectedTabIdx;
  }


  changeTab(idx: number) {
    if ((idx !== this.selectedTabIdx) && (idx >= 0) && (idx < this.tabs.length)) {
      this.selectedTabIdx = idx;
    }
  }

}
