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
  // introDisplayed: boolean = true; // PR #1267 | PD-483: display full page title with description
  connectMarketDisplayed: boolean = false; // show "connect new market" section
  createMarketDisplayed: boolean = false; // show "create new market" section

  filters: any = {
    search:   undefined,
    sort:     undefined
  };

  connectTo: any = { // Connect to new Private Market
    marketName:   undefined,
    marketID:     undefined
  };

  createMarket: any = { // Create new Private Market
    marketName:   undefined,
    marketID:     '3127907a7623734f830e8c69ccee03b693bf993e' // TODO: just a placeholder, replace with live ID
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
