import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GenericOrderModalInputs, OrderModalResponse } from '../../../services/orders/orders.models';


@Component({
  templateUrl: './reject-bid-modal.component.html',
  styleUrls: ['./reject-bid-modal.component.scss']
})
export class RejectBidModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericOrderModalInputs,
    private _dialogRef: MatDialogRef<RejectBidModalComponent>,
  ) { }


  doAction() {
    const modalResponse: OrderModalResponse = {
      doAction: true,
      params: {}
    };
    this._dialogRef.close(modalResponse);
  }

}
