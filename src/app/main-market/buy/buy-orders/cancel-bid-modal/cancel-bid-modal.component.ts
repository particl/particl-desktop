import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GenericOrderModalInputs, OrderModalResponse } from '../../../services/orders/orders.models';


@Component({
  templateUrl: './cancel-bid-modal.component.html',
  styleUrls: ['./cancel-bid-modal.component.scss']
})
export class CancelBidModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericOrderModalInputs,
    private _dialogRef: MatDialogRef<CancelBidModalComponent>,
  ) { }


  doAction() {
    const modalResponse: OrderModalResponse = {
      doAction: true,
      params: {}
    };
    this._dialogRef.close(modalResponse);
  }
}
