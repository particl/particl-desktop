import { Component, OnInit, Input } from '@angular/core';
import { Log } from 'ng2-logger'

import { TransactionService } from '../transaction.service';

@Component({
  selector: 'transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  providers: [TransactionService]
})

export class TransactionsTableComponent implements OnInit {
  /* Determines what fields are displayed in the Transaction Table. */
    /* header and utils */

  private _defaults: any = {
    header: true,
    internalHeader: false,
    pagination: false,
    txDisplayAmount: 10,
    category: true,
    date: true,
    amount: true,
    confirmations: true,
    txid: false,
    senderAddress: true,
    receiverAddress: true,
    comment: true,
    blockHash: false,
    blockIndex: false,
    expand: false
  };

  @Input() display: any;


  /*
    This shows the expanded table for a specific unique identifier = (tx.txid + tx.getAmount() + tx.category).
    If the unique identifier is present, then the details will be expanded.
  */
  private expandedTransactionID: string = undefined;


  log: any = Log.create('transaction-table.component');

  constructor(public txService: TransactionService) {

  }

  ngOnInit() {
    this.display = Object.assign({}, this._defaults, this.display); // Set defaults

    this.txService.postConstructor(this.display.txDisplayAmount);
  }

  public pageChanged(event: any): void {
    this.txService.changePage(event.page);

    this.log.d('Page changed to:', event.page);
    this.log.d('Number items per page:', event.itemsPerPage);

  }

  public showExpandedTransactionDetail(txid: string) {
    if (this.expandedTransactionID === txid) {
      this.expandedTransactionID = undefined;
    } else {
      this.expandedTransactionID = txid;
    }
  }

  public getExpandedTransactionID() {
    return this.expandedTransactionID;
  }
}
