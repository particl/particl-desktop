import { Component, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BidOrderService } from 'app/main-market/services/orders/orders.service';
import { GenericOrderModalInputs, OrderModalResponse } from '../../../services/orders/orders.models';


@Component({
  templateUrl: './reject-bid-modal.component.html',
  styleUrls: ['./reject-bid-modal.component.scss']
})
export class RejectBidModalComponent {

  readonly reasonOptions: { key: string; label: string; }[];
  inputReason: FormControl = new FormControl('');

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericOrderModalInputs,
    private _dialogRef: MatDialogRef<RejectBidModalComponent>,
    private _orderService: BidOrderService
  ) {
    this.reasonOptions = this._orderService.getRejectReasons();
  }


  doAction() {
    const modalResponse: OrderModalResponse = {
      doAction: true,
      params: {}
    };

    if (this.inputReason.value) {
      modalResponse.params.memo = this.inputReason.value;
    }
    this._dialogRef.close(modalResponse);
  }

}
