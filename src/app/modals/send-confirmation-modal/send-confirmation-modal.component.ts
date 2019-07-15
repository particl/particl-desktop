import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { TransactionBuilder } from 'app/wallet/wallet/send/transaction-builder.model';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { Amount, Fee } from 'app/core/util/utils';
import { SendService } from 'app/wallet/wallet/send/send.service';

@Component({
  selector: 'app-send-confirmation-modal',
  templateUrl: './send-confirmation-modal.component.html',
  styleUrls: ['./send-confirmation-modal.component.scss']
})
export class SendConfirmationModalComponent implements OnInit {

  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();

  public dialogContent: string;
  public send: TransactionBuilder;

  transactionType: string = '';
  sendAmount: Amount = new Amount(0);
  sendAddress: string = '';
  receiverName: string = '';
  transactionAmount: Fee = new Fee(0);
  estimateError: boolean = false;

  constructor(private dialogRef: MatDialogRef<SendConfirmationModalComponent>,
              private sendService: SendService) {
  }

  ngOnInit() {
    this.setTxDetails();
  }

  confirm(): void {
    this.onConfirm.emit();
    this.dialogClose();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

  /**
    * Set the confirmation modal data for tx
    */
  setTxDetails(): void {
    this.getTransactionFee();

    this.sendAddress = this.send.toAddress;
    this.transactionType = this.send.input;
    this.sendAmount = new Amount(this.send.amount);
    this.receiverName = this.send.toLabel;
  }

  getTransactionFee() {
    this.sendService.getTransactionFee(this.send).subscribe(
      (fee) => {
        this.transactionAmount = new Fee(fee.fee);
      },
      (err) => {
        const noFunds = ((typeof err.message === 'string') && (<string>err.message).toLowerCase().includes('insufficient funds') );
        // const txTotal = this.transactionAmount.getAmountWithFee(this.sendAmount.getAmount(), !this.send.subtractFeeFromAmount );
        // const denom = Math.max(txTotal, this.sendAmount.getAmount());
        // const tenPercentThreshold = Math.abs(
        //   (txTotal - this.sendAmount.getAmount()) / (denom > 0 ? denom : 1) * 100
        // ) <= 10;

        if (noFunds && !this.send.subtractFeeFromAmount) {
          this.send.subtractFeeFromAmount = true;

          this.sendService.getTransactionFee(this.send).subscribe(
            (fee) => {
              this.transactionAmount = new Fee(fee.fee);
            },
            () => {
              this.estimateError = true;
            }
          );
        } else {
          this.estimateError = true;
        }
      });
  }

}
