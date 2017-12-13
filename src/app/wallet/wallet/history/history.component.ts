import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { TransactionCategory } from '../shared/transaction.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class HistoryComponent implements OnInit {

  @ViewChild('filterList') filterList: any;

  narrationChoices: Array<any> = [
    { title: 'With narration',    value: 'narrationOnly'     },
    { title: 'Without narration', value: 'noNarration'       },
    { title: 'Both',              value: 'any'               }
  ];
  filterOptions:    Array<any> = [
    { title: 'All',               value: "all"               },
    { title: 'Send',              value: "send"              },
    { title: 'Orphan',            value: "orphan"            },
    { title: 'Immature',          value: "immature"          },
    { title: 'Coinbase',          value: "coinbase"          },
    { title: 'Receive',           value: "receive"           },
    { title: 'Orphaned stake',    value: "orphaned_stake"    },
    { title: 'Stake',             value: "stake"             },
    { title: 'Internal transfer', value: "internal_transfer" }
  ];

  narration: string = 'any';
  filters: Array<string> = [];

  constructor() { }

  ngOnInit() {
    this.filterList.selectedOptions.onChange.subscribe(item => {
      item.added.map(added => this.filters.push(added.value));
      item.removed.map(removed => this.filters = this.filters.filter(val => {
        return val !== removed.value;
      }));
    });
  }

  clear() {
    this.narration = 'any';
    this.filterList.deselectAll();
  }
}
