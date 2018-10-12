import { Component, OnInit } from '@angular/core';
//import { Router } from '@angular/router';

@Component({
  selector: 'app-private-markets',
  templateUrl: './private-markets.component.html',
  styleUrls: ['./private-markets.component.scss']
})
export class PrivateMarketsComponent implements OnInit {
  public isLoading: boolean = false;

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['connected-markets', 'my-markets'];

  public search: string = '';

  filters: any = {
    search:   undefined,
    sort:     undefined
  };

  constructor(
    //private router: Router,
  ) {}

  ngOnInit() {
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

  clear(): void {
    this.filters = {
      search:   undefined,
      sort:     undefined
    };
  }

}
