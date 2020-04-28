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

  constructor() { }

  ngOnInit() {
  }

}
