import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-exchange-bots',
  templateUrl: './exchange-bots.component.html',
  styleUrls: ['./exchange-bots.component.scss']
})
export class ExchangeBotsComponent implements OnInit {

  filters: any = {
    search:   ''
  };
  isLoadingBig: boolean = false;
  bot: any = {};

  supported_coins: Array<any> = [
    // sort alphabetically
    { title: 'Bitcoin',   value: 'btc', },
    { title: 'DAI',       value: 'dai', },
    { title: 'Horizen',   value: 'zen', },
    { title: 'Particl',   value: 'part', }
  ];

  bot_filter: Array<any> = [
    { title: 'All bots',        value: 'all',         amount: '3' },
    { title: 'Active bots',     value: 'active',      amount: '1' },
    { title: 'Available bots',  value: 'available',   amount: '2' }
  ];

  constructor() { }

  ngOnInit() {
  }

  clearAndLoadPage() {}

  filter() {}

  loadNextPage() {}

}
