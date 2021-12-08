import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  templateUrl: './resend-order-action-confirmation-modal.component.html',
  styleUrls: ['./resend-order-action-confirmation-modal.component.scss']
})
export class ResendOrderActionConfirmationModalComponent {

  constructor(
    private _dialogRef: MatDialogRef<ResendOrderActionConfirmationModalComponent>,
  ) { }


  doAction() {
    this._dialogRef.close(true);
  }

}
