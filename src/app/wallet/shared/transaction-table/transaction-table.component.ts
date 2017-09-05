import { Component, OnInit, Input } from '@angular/core';
import { Log } from 'ng2-logger'
import { ElectronService } from 'ngx-electron';
import { TransactionService } from '../transaction.service';
import { Transaction } from '../transaction.model';

@Component({
  selector: 'transaction-table',
  templateUrl: './transaction-table.component.html',
  styleUrls: ['./transaction-table.component.scss'],
  providers: [TransactionService]
})

export class TransactionsTableComponent implements OnInit {
  /* Determines what fields are displayed in the Transaction Table. */
    /* header and utils */

  public isElectron: boolean = false;
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

  constructor(public txService: TransactionService, public electronService: ElectronService) {
    this.isElectron = this.electronService.isElectronApp;
  }

  ngOnInit() {
    this.display = Object.assign({}, this._defaults, this.display); // Set defaults
    this.log.d(`transaction-table: amount of transactions per page ${this.display.txDisplayAmount}`)
    this.txService.postConstructor(this.display.txDisplayAmount);
  }

  public pageChanged(event: any): void {
    this.txService.changePage(event.page);

    this.log.d('Page changed to:', event.page);
    this.log.d('Number items per page:', event.itemsPerPage);

  }

  public showExpandedTransactionDetail(tx: Transaction) {
    const txid: string = tx.getExpandedTransactionID();
    if (this.expandedTransactionID === txid) {
      this.expandedTransactionID = undefined;
    } else {
      this.expandedTransactionID = txid;
    }
  }

  // Link to blockchain explorer
  public openSingleTransactionWindow(tx: Transaction) {
    if (this.isElectron) {
      this.electronService.shell.openExternal('https://explorer-testnet.particl.io/tx/' + tx);
    } else {
      window.open('https://explorer-testnet.particl.io/tx/' + tx, '_blank')
    }
  }

  public checkExpandDetails(tx: Transaction) {
    return (this.expandedTransactionID === tx.getExpandedTransactionID());
  }
}
