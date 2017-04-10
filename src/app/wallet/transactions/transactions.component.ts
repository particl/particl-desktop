import { Component, OnInit } from '@angular/core';
import { Transaction } from './transaction';
import { TransactionService } from './transaction-service.service';


@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  providers: [TransactionService]
})
export class TransactionsComponent implements OnInit {

	s;


  constructor(private transactionService: TransactionService) {
  	//make life easy in component html
  	this.s = this.transactionService;
  }

  ngOnInit() {

  }

  switchPage(page : number) {
    console.log("Moving to page " + (page + 1));
    this.s.changePage(page);
  }
}
