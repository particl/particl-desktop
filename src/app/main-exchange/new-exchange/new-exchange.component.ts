import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-exchange',
  templateUrl: './new-exchange.component.html',
  styleUrls: ['./new-exchange.component.scss']
})
export class NewExchangeComponent implements OnInit {

  filters: any = {
    search:   ''
  };

  supported_coins: Array<any> = [
    // sort alphabetically
    { title: 'Bitcoin',   value: 'btc', },
    { title: 'DAI',       value: 'dai', },
    { title: 'Horizen',   value: 'zen', },
    { title: 'Particl',   value: 'part', }
  ];

  exchanges_list: Array<any> = [
    // sort by best rate?
    { title: 'SimpleSwap',  value: 'simpleswap',  amount: '0.5413',   rate: '145.5163',   tag: 'Best rate' },
    { title: 'Changelly',   value: 'changelly',   amount: '0.5315',   rate: '146.5413',   tag: '' },
    { title: 'StealthEx',   value: 'stealthex',   amount: '0.5138',   rate: '147.1052',   tag: '' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
