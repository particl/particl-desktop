import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';


enum TextContent {
}


@Component({
  selector: 'market-joined-markets',
  templateUrl: './joined-markets.component.html',
  styleUrls: ['./joined-markets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinedMarketsComponent implements OnInit, OnDestroy {


  markets_filtering: Array<any> = [
    { title: 'All markets',       value: '' },
    { title: 'Community Markets', value: 'community' },
    { title: 'Storefronts',       value: 'storefronts' }
  ];

  searchQuery: FormControl = new FormControl('');
  isPageLoading: boolean = false;


  constructor(
    private _cdr: ChangeDetectorRef,
  ) { }


  ngOnInit() {
  }


  ngOnDestroy() {
  }
}
