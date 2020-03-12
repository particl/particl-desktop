import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';


interface DisableColdstakingTemplateInputs {
  txCount: number;
  fees: number;
  errorCount: number;
}


@Component({
  templateUrl: './disable-coldstaking-confirmation-modal.component.html',
  styleUrls: ['./disable-coldstaking-confirmation-modal.component.scss']
})
export class DisableColdstakingConfirmationModalComponent {

  @Output() isConfirmed: EventEmitter<boolean> = new EventEmitter();

  readonly txCount: number;
  readonly fees: number;
  readonly errorTXs: number;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DisableColdstakingTemplateInputs,
    private _dialogRef: MatDialogRef<DisableColdstakingConfirmationModalComponent>,
  ) {
    this.txCount = Math.max(+data.txCount || 0, 0);
    this.fees = Math.max(+data.fees || 0, 0);
    this.errorTXs = Math.max(+data.errorCount || 0, 0);
  }


  confirm() {
    this.isConfirmed.emit(true);
    this._dialogRef.close();
  }

}
