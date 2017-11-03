import { Component, OnInit, Input } from '@angular/core';
import { Log } from 'ng2-logger'
import { TransactionService } from '../transaction.service';
import { Transaction } from '../transaction.model';

import { slideDown } from '../../../core/core.animations';
import { PageEvent } from '@angular/material';

@Component({
  selector: 'transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  providers: [TransactionService],
  animations: [slideDown()]
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

  // MatPaginator Output
  pageEvent: PageEvent;

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
    this.log.d(`transaction-table: amount of transactions per page ${this.display.txDisplayAmount}`)
    this.txService.postConstructor(this.display.txDisplayAmount);
  }

  public pageChanged(event: any): void {
    this.log.d('pageChanged:', event);
    this.txService.MAX_TXS_PER_PAGE = event.pageSize;
    // increase page index because its start from 0
    this.txService.changePage(event.pageIndex++);
  }

  public showExpandedTransactionDetail(tx: Transaction) {
    const txid: string = tx.getExpandedTransactionID();
    if (this.expandedTransactionID === txid) {
      this.expandedTransactionID = undefined;
    } else {
      this.expandedTransactionID = txid;
    }
  }

  public checkExpandDetails(tx: Transaction) {
    return (this.expandedTransactionID === tx.getExpandedTransactionID());
  }

  public calculateNetAmount(fee: number, amount: number) {
    if (amount < 0) { // sent
      return amount + fee;
    } else { // received
      return amount - fee;
    }
  }
}
