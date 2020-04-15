import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { PlaceOrderModalComponent } from './place-order-modal/place-order-modal.component';

@Component({
  selector: 'app-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss']
})
export class CheckoutProcessComponent implements OnInit {

  saveShippingProfile = false;

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }


  placeOrderModal(): void {
    const dialog = this._dialog.open(PlaceOrderModalComponent);
  }

}
