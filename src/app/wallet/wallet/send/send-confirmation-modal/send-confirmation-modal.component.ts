import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Amount } from '../../../shared/util/utils';

@Component({
  selector: 'app-send-confirmation-modal',
  templateUrl: './send-confirmation-modal.component.html',
  styleUrls: ['./send-confirmation-modal.component.scss']
})
export class SendConfirmationModalComponent {

  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();

  public dialogContent: string;

  // send-confirmation-modal variables
  transactionType: string = '';
  sendAmount: Amount;
  sendAddress: string = '';
  receiverName: string = '';
  transactionFee: number = 0;
  totalAmount: number = 0;

  constructor(private dialogRef: MatDialogRef<SendConfirmationModalComponent>) { 
  }

  confirm(): void {
    this.onConfirm.emit();
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

  /**
    * Set the modal details
    * TODO: Create proper Interface for `send` parameter
    */
  setDetails(send: any): void {
    this.sendAddress = send.toAddress;
    this.transactionType = send.input;
    this.sendAmount = new Amount(send.amount);
    this.receiverName = send.toLabel;
    this.transactionFee = 0;
    this.totalAmount = send.amount;
    console.log(this.transactionType);
  }

}
