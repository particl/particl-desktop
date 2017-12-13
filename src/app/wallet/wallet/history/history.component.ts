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
    { title: 'All transactions',  value: 'all'               },
    { title: 'Send',              value: 'send'              },
    { title: 'Orphan',            value: 'orphan'            },
    { title: 'Immature',          value: 'immature'          },
  //{ title: 'Coinbase',          value: 'coinbase'          },
    { title: 'Receive',           value: 'receive'           },
    { title: 'Orphaned stake',    value: 'orphaned_stake'    },
    { title: 'Stake',             value: 'stake'             },
    { title: 'Internal transfer', value: 'internal_transfer' }
  ];

  types:    Array<any> = [
    { title: 'All transactions',  value: 'all'               },
    { title: 'Public',            value: 'public'            },
    { title: 'Blind',             value: 'blind'             },
    { title: 'Anon',              value: 'anon'              }
  ];

  sortings:    Array<any> = [
    { title: 'Sort by date',           value: 'time'              },
    { title: 'Sort by address',        value: 'address'           },
    { title: 'Sort by category',       value: 'category'          },
    { title: 'Sort by amount',         value: 'amount'            },
  //{ title: 'Sort by confirmations',  value: 'confirmations'     }, // hide: basically the same as "time"
  //{ title: 'Sort by TXID',           value: 'txid'              } // hide: honestly, will this use someone?
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
