import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';


interface ZapTemplateInputs {
  fee: number;
}


@Component({
  templateUrl: './zap-coldstaking-modal.component.html',
  styleUrls: ['./zap-coldstaking-modal.component.scss']
})
export class ZapColdstakingModalComponent {

  @Output() isConfirmed: EventEmitter<boolean> = new EventEmitter();

  readonly fee: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ZapTemplateInputs,
    private _dialogRef: MatDialogRef<ZapColdstakingModalComponent>,
  ) {
    this.fee = Math.max(+data.fee || 0, 0);
  }


  zap() {
    this.isConfirmed.emit(true);
    this._dialogRef.close();
  }
}
