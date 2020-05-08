import { Component } from '@angular/core';


@Component({
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss']
})
export class SellComponent {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['orders', 'listings', 'questions'];
  //private resizeEventer: any;

  filters: any = {
    search:   '',
    sort:     'DATE',
    category: '*',
    hashItems: ''
  };

  listing_sortings: Array<any> = [
    { title: 'By title', value: 'TITLE' },
    { title: 'By status', value: 'STATE' }
  ];

  listing_filtering_status: Array<any> = [
    { title: 'All Listings',  value: '' },
    { title: 'Published',     value: true },
    { title: 'Unpublished',   value: false }
  ];

  listing_filtering_market: Array<any> = [
    { title: 'All Markets',     value: 'one' },
    { title: 'Particl Open Marketplace',     value: 'two' },
    { title: 'Sneaky Market',   value: 'three' }
  ];




  clear(): void {
    this.filters = {
      search:   '',
      sort:     'DATE',
      category: '*',
      hashItems: ''
    };
    if (this.selectedTab === 1) {
      //this.loadPage(0, true);
    }
  }

  changeTab(index: number): void {
    this.selectedTab = index;
    this.clear();
  }

}
