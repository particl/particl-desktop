import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-private-markets',
  templateUrl: './private-markets.component.html',
  styleUrls: ['./private-markets.component.scss']
})
export class PrivateMarketsComponent implements OnInit {
  public isLoading: boolean = false;

  public search: string = '';

  // UI logic
  introDisplayed: boolean = true; // full page title with description visible
  connectMarketDisplayed: boolean = false; // show "connect new market" section

  filters: any = {
    search:   undefined,
    sort:     undefined
  };

  connectTo: any = { // Connect to new Private Market
    marketName:   undefined,
    marketID:     undefined
  };

  sortings: any = [
    { value: 'by-name', viewValue: 'By name' },
    { value: 'by-id', viewValue: 'By Market ID '},
    { value: 'by-updated', viewValue: 'By updated date' },
  ];

  constructor(
    // private router: Router,
  ) {}

  ngOnInit() {
  }

  clear(): void {
    this.filters = {
      search:   undefined,
      sort:     undefined
    };
  }

}
