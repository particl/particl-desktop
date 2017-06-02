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

  /* Determines what fields are displayed in the Transaction Table. */
    /* header and utils */
  @Input() displayHeader: boolean = true;
  @Input() displayInternalHeader: boolean = false;
  @Input() displayPagination: boolean = false;

    /* actual fields */
  @Input() displayCategory: boolean = true;
  @Input() displayDate: boolean = true;
  @Input() displayAmount: boolean = true;
  @Input() displayConfirmations: boolean = false;
  @Input() displayTxId: boolean = false;
  @Input() displaySenderAddress: boolean = false;
  @Input() displayReceiverAddress: boolean = false;
  @Input() displayComment: boolean = false;
  @Input() displayBlockHash: boolean = false;
  @Input() displayBlockIndex: boolean = false;

  constructor(private _transactionService: TransactionsTableService) {
    // make life easy in component html
    this.txService = _transactionService;
  }

  ngOnInit() {

  }


  public pageChanged(event:any):void {
    this.txService.changePage(event.page);
    console.log('Page changed to: ' + event.page);
    console.log('Number items per page: ' + event.itemsPerPage);
  }
}
