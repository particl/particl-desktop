import { Component, EventEmitter, Output, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { SendTransaction, TxType } from '../send.models';
import { PartoshiAmount } from 'app/core/util/utils';


interface SendConfirmationModalTemplateInputs {
  sendTx: SendTransaction;
  fee: number;
}


@Component({
  selector: 'app-send-confirmation-modal',
  templateUrl: './send-confirmation-modal.component.html',
  styleUrls: ['./send-confirmation-modal.component.scss']
})
export class SendConfirmationModalComponent {

  @Output() isConfirmed: EventEmitter<string> = new EventEmitter<string>();

  readonly txType: TxType;
  readonly requestedWhole: string;
  readonly requestedFraction: string;
  readonly txFee: string;
  readonly receiverName: string;
  readonly targetAddress: string;
  readonly isSubtractingFee: boolean;
  readonly totalAmount: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SendConfirmationModalTemplateInputs,
    private _dialogRef: MatDialogRef<SendConfirmationModalComponent>,
  ) {
    this.txType = this.data.sendTx.source;
    const requested = new PartoshiAmount(this.data.sendTx.amount * Math.pow(10, 8));
    this.requestedWhole = requested.particlStringInteger();
    this.requestedFraction  = requested.particlStringFraction();
    this.txFee = `${data.fee}`;
    this.receiverName = this.data.sendTx.addressLabel;
    this.targetAddress = this.data.sendTx.transactionType === 'send' ? this.data.sendTx.targetAddress : '';
    this.isSubtractingFee = this.data.sendTx.deductFeesFromTotal;
    const total = this.isSubtractingFee ?
        requested.subtract(new PartoshiAmount((data.fee || 0) * Math.pow(10, 8))) :
        requested.add(new PartoshiAmount((data.fee || 0) * Math.pow(10, 8)));
    this.totalAmount = total.particlsString();
  }


  confirm(): void {
    this.isConfirmed.emit();
    this._dialogRef.close();
  }
}
