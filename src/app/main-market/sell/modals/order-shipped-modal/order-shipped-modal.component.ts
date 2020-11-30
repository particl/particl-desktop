import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { GenericOrderModalInputs, OrderModalResponse } from '../../../services/orders/orders.models';


@Component({
  templateUrl: './order-shipped-modal.component.html',
  styleUrls: ['./order-shipped-modal.component.scss']
})
export class OrderShippedModalComponent {

  shippingMemo: FormControl = new FormControl('', Validators.maxLength(250));

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericOrderModalInputs,
    private _dialogRef: MatDialogRef<OrderShippedModalComponent>,
  ) { }


  doAction() {
    if (!this.shippingMemo.valid) {
      return;
    }

    const modalResponse: OrderModalResponse = {
      doAction: true,
      params: {}
    };

    if (this.shippingMemo.value) {
      modalResponse.params.memo = this.shippingMemo.value;
    }

    this._dialogRef.close(modalResponse);
  }

}
