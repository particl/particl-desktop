import { Component, OnInit } from '@angular/core';

import { TransactionCategory } from '../shared/transaction.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  category: TransactionCategory = "all";

  constructor() { }

  ngOnInit() {
  }

  filterByCategory(category: TransactionCategory) {
    console.log(`filter by: ${category}`);
    this.category = category;
  }

}
