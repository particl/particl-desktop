import { Component } from '@angular/core';

import { TransactionCategory } from '../shared/transaction.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class HistoryComponent {

  narration_filter: Array<string> = ['With narration', 'Without narration'];
  type_filter:      Array<string> = [
    'Received',
    'Sent',
    'Staked',
    'Orphaned stakes',
    'Balance transfer'
  ];

  constructor() { }

}
