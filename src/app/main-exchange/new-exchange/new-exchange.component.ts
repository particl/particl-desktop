import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ExchangePayModalComponent } from './exchange-pay-modal/exchange-pay-modal.component';

@Component({
  selector: 'app-new-exchange',
  templateUrl: './new-exchange.component.html',
  styleUrls: ['./new-exchange.component.scss']
})
export class NewExchangeComponent implements OnInit {

  supported_coins: Array<any> = [
    // sort alphabetically
    { title: 'Bitcoin',   value: 'btc', },
    { title: 'DAI',       value: 'dai', },
    { title: 'Monero',    value: 'xmr', },
    { title: 'NIX',       value: 'nix', },
    { title: 'Particl',   value: 'part', },
    { title: 'Tether',    value: 'usdt', },
    { title: 'USD Coin',  value: 'usdc', },
    { title: 'ZCoin',     value: 'xzc', }
  ];

  exchanges_list: Array<any> = [
    // sort by best rate?
    { title: 'SimpleSwap', image: './assets/app-exchange/exchanges/simpleswap.svg',
      value: 'simpleswap', amount: '0.5413', rate: '145.5163', tag: 'Best rate' },
    { title: 'Changelly', image: './assets/app-exchange/exchanges/changelly.svg',
      value: 'changelly', amount: '0.5315', rate: '146.5413', tag: '' },
    { title: 'StealthEx', image: './assets/app-exchange/exchanges/stealthex.svg',
      value: 'stealthex', amount: '0.5138', rate: '147.1052', tag: '' }
  ];

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openExchangePayModal(): void {
    const dialog = this._dialog.open(ExchangePayModalComponent);
  }

}
