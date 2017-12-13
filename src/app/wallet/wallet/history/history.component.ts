import { Component, ViewChild, ElementRef } from '@angular/core';

import { TransactionCategory } from '../shared/transaction.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class HistoryComponent {

  narration: string = 'Both';
  filter:    string;

  // TODO : key-value
  narrationChoices: Array<string> = ['With narration', 'Without narration', 'Both'];
  filterOptions:    Array<string> = [
    'Received',
    'Sent',
    'Staked',
    'Orphaned stakes',
    'Balance transfer'
  ];

  @ViewChild('filterList') filterList: any;

  constructor() { }

  dump() {
    console.log(this.narration, this.filter);
  }

  clear() {
    console.log("clear");
    this.narration = 'Both';
    this.filterList.deselectAll();
  }
}
