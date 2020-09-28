import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';


enum TextContent {
}


@Component({
  selector: 'market-browser',
  templateUrl: './market-browser.component.html',
  styleUrls: ['./market-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketBrowserComponent implements OnInit, OnDestroy {

  markets_status: Array<any> = [
    { title: 'Show joined & available', value: 'all' },
    { title: 'Joined Markets only',     value: 'joined' },
    { title: 'Available Markets only',  value: 'available' }
  ];

  markets_filtering: Array<any> = [
    { title: 'All markets',       value: '' },
    { title: 'Community Markets', value: 'community' },
    { title: 'Storefronts',       value: 'storefronts' }
  ];

  showJoinMarketForm: boolean = false;
  searchQuery: FormControl = new FormControl('');


  constructor(
    private _cdr: ChangeDetectorRef,
  ) { }


  ngOnInit() {
  }


  ngOnDestroy() {
  }
}
