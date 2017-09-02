import { Component } from '@angular/core';

import { TransactionCategory } from '../shared/transaction.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {

  category: TransactionCategory = 'all';
  tabsTtitles: Array<any> = ['all', 'send', 'receive', 'stake', 'orphaned Stake'];

  constructor() { }

  filterByCategory(category: TransactionCategory) {
    this.category = category;
  }

  changeTab(tabIndex: number): void {
    if (tabIndex === 4) {
      this.filterByCategory(this.tabsTtitles['orphaned_stake']);
    } else {
      this.filterByCategory(this.tabsTtitles[tabIndex]);
    }
  }
}
