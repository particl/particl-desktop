import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { TransactionCategory } from '../shared/transaction.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class HistoryComponent implements OnInit {

  // @ViewChild('filterList') filterList: any;

  categories:    Array<any> = [
    { title: 'All',               value: 'all'               },
    { title: 'Send',              value: 'send'              },
    { title: 'Orphan',            value: 'orphan'            },
    { title: 'Immature',          value: 'immature'          },
    { title: 'Coinbase',          value: 'coinbase'          },
    { title: 'Receive',           value: 'receive'           },
    { title: 'Orphaned stake',    value: 'orphaned_stake'    },
    { title: 'Stake',             value: 'stake'             },
    { title: 'Internal transfer', value: 'internal_transfer' }
  ];

  category: string = 'all';

  constructor() {
    this.default();
  }

  ngOnInit() {
    // this.filterList.selectedOptions.onChange.subscribe(item => {
    //   item.added.map(added => this.filters.push(added.value));
    //   item.removed.map(removed => this.filters = this.filters.filter(val => {
    //     return val !== removed.value;
    //   }));
    // });
  }

  default() {
    this.category = 'all';
    // this.filterList.deselectAll();
  }

  dump() {
    console.log('category', this.category);
  }

  clear() {
    this.default();
  }
}
