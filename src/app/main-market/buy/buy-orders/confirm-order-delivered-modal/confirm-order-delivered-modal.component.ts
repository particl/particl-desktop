import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { GenericOrderModalInputs, OrderModalResponse } from '../../../services/orders/orders.models';


@Component({
  templateUrl: './confirm-order-delivered-modal.component.html',
  styleUrls: ['./confirm-order-delivered-modal.component.scss']
})
export class ConfirmOrderDeliveredModalComponent {

  reviewMemo: FormControl = new FormControl('', Validators.maxLength(250));


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericOrderModalInputs,
    private _dialogRef: MatDialogRef<ConfirmOrderDeliveredModalComponent>,
  ) { }


  doAction() {
    if (!this.reviewMemo.valid) {
      return;
    }

    const modalResponse: OrderModalResponse = {
      doAction: true,
      params: {}
    };

    if (this.reviewMemo.value) {
      modalResponse.params.memo = this.reviewMemo.value;
    }

    this._dialogRef.close(modalResponse);
  }

}
