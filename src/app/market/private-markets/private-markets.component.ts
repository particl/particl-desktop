import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-private-markets',
  templateUrl: './private-markets.component.html',
  styleUrls: ['./private-markets.component.scss']
})
export class PrivateMarketsComponent implements OnInit {

  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['connected-markets', 'my-markets'];

  constructor() { }

  ngOnInit() {
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

}
