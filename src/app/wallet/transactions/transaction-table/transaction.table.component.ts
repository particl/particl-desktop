import { Component, OnInit, Input } from '@angular/core';
import { Transaction } from './transaction';
import { TransactionsTableService } from './transaction.table.service';


@Component({
  selector: 'app-transaction-table',
  templateUrl: './transaction.table.component.html',
  styleUrls: ['./transaction.table.component.css'],
  providers: [TransactionsTableService]
})
export class TransactionsTableComponent implements OnInit {

	txService;
  @Input() displayPagination: boolean;

  constructor(private _transactionService: TransactionsTableService) {
  	//make life easy in component html
  	this.txService = _transactionService; 
  }

  ngOnInit() {

  }

  switchPage(page : number) {
    console.log("Moving to page " + (page + 1));
    this.txService.changePage(page);
  }
}
