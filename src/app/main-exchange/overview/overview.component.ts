import { Component, OnInit } from '@angular/core';

import * as _ from 'lodash';
import { DateFormatter } from 'app/core/util/utils';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class ExchangeOverviewComponent implements OnInit {

  /* test only >>> */

  public exchange: any = {
    bot: {
      name: 'SimpleSwap',
      image: './assets/images/placeholder_4-3.jpg'
    },
    status: 'Active',
    amount_from: 0.2,
    amount_to: 2050,
    currency_from: 'BTC',
    currency_to: 'PART',
    address_from: 'dujfnsdfnsafdnsk',
    address_to: 'safdnskdujfnsdfn',
    tx_from: 'bsjahdbfsadfdsfbsadifbsakdfaksdfsahdbfsajdhfbasjhdf',
    tx_to: 'dsfbsadifbsakdfaksdfsahdbfsajdhfbasjhdfbsjahdbfsadf',
    track_id: 'sdkfbsakfhdbaskjfd',
    created_date: '2020-04-21 15:38:12',
    updated_date: '2020-04-21 15:38:12',
  }

  /* << test only */

  filters: any = {
    search:   ''
  };

  exchange_status: Array<any> = [
    { title: 'All exchanges', value: 'all',         amount: '3' },
    { title: 'Active',        value: 'active',      amount: '1' },
    { title: 'Completed',     value: 'completed',   amount: '2' },
    { title: 'Cancelled',     value: 'cancelled',   amount: '0' }
  ];

  constructor() { }

  ngOnInit() {
  }

  formatDate(date: string): string {
    if (!date) {
      return '';
    }
    return new DateFormatter(new Date(date)).dateFormatter(false);
  }

}
