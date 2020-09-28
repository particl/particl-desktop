import { Component, ChangeDetectionStrategy } from '@angular/core';


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


  constructor() {}


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
