import { Component, OnInit, Input } from '@angular/core';

import { TransactionService } from '../transaction.service';


@Component({
  selector: 'transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss']
})
export class TransactionsTableComponent implements OnInit {
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

  constructor(public txService: TransactionService) {
    // make life easy in component html
  }

  ngOnInit() {
  }

  public pageChanged(event: any): void {
    this.txService.changePage(event.page);
    console.log('Page changed to: ' + event.page);
    console.log('Number items per page: ' + event.itemsPerPage);
  }
}
