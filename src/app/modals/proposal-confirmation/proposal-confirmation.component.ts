import { Component, EventEmitter, OnInit, Input, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Amount, sizeof } from 'app/core/util/utils';

@Component({
  selector: 'app-proposal-confirmation',
  templateUrl: './proposal-confirmation.component.html',
  styleUrls: ['./proposal-confirmation.component.scss']
})
export class ProposalConfirmationComponent {
  public data: any;
  public dialogContent: string;
  private callback: any;
  public proposalTransactionFee: Amount;

  constructor(private dialogRef: MatDialogRef<ProposalConfirmationComponent>) { }

  confirm(): void {
    this.callback(this.data);
  }

  /**
    * setData sets the callback information for when the wallet unlocks.
    */

  setData(data: any, callback: Function): void {
    this.data = data;

    /* @TODO
     * calculate proposalTransactionFee based on message of size 512kb costs 0.26362200 PART for 1 day.
     * and for 1kb memory = cost (0.00050696538)
     * totalCost = (memorySize / 1000) (in kb(s)) * 0.00050696538 (1kb memory cost) *  7 (days)
     */

    const memorySize = sizeof(this.data);
    const totalCost = (memorySize / 1000) * 0.00050696538 * 7;
    this.proposalTransactionFee = new Amount(totalCost);
    this.callback = callback;
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

}
