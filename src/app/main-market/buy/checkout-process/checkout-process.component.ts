import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingDetailModalComponent } from './../../shared/listing-detail-modal/listing-detail-modal.component';
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


  openListingDetailModal(): void {
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }

  placeOrderModal(): void {
    const dialog = this._dialog.open(PlaceOrderModalComponent);
  }

}
