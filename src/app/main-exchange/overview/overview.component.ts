import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class ExchangeOverviewComponent implements OnInit {

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

}
