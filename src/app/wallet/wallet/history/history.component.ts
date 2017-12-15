import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class HistoryComponent implements OnInit {

  // @ViewChild('filterList') filterList: any;
  @ViewChild('transactions') transactions: any;

  categories: Array<any> = [
    { title: 'All transactions', value: 'all'               },
    { title: 'Send',             value: 'send'              },
    { title: 'Receive',          value: 'receive'           },
    { title: 'Immature',         value: 'immature'          },
    { title: 'Stake',            value: 'stake'             },
    { title: 'Balance transfer', value: 'internal_transfer' }
    // { title: 'Orphan',            value: 'orphan'            },
    // { title: 'Coinbase',          value: 'coinbase'          },
    // { title: 'Orphaned stake',    value: 'orphaned_stake'    },
  ];

  sortings: Array<any> = [
    { title: 'By time',                  value: 'time'          },
    { title: 'By amount',                value: 'amount'        },
    { title: 'By address',               value: 'address'       },
    { title: 'By category',              value: 'category'      },
    { title: 'By confirmations',         value: 'confirmations' },
    { title: 'By transaction ID (txid)', value: 'txid'          }
  ];

  types: Array<any> = [
    { title: 'All types', value: 'all'      },
    { title: 'Standard',  value: 'standard' },
    { title: 'Anonymous', value: 'anon'     },
    { title: 'Blind',     value: 'blind'    },
  ];

  filters: any = {
    category: undefined,
    search:   undefined,
    sort:     undefined,
    type:     undefined
  };

  constructor() {
    this.default();
  }

  ngOnInit() {
    /* may be used if we concatenate some filters */
  }

  default() {
    this.filters = {
      category: 'all',
      type:     'all',
      sort:     'time',
      search:   ''
    };
  }

  changeCategory(index: number) {
    this.filters.category = this.categories[index];
    this.filter();
  }

  filter() {
    this.dump();
    console.log('transactions component', this.transactions);
    this.transactions.filter(this.filters);
  }

  sortList(event): void {
    this.filters.sort = event.value;
    this.filter();
  }

  dump() {
    console.log('filters', this.filters);
  }

  clear() {
    this.dump();
    this.default();
    this.filter();
  }
}
