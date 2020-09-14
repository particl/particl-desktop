import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingDetailModalComponent } from './../../../shared/listing-detail-modal/listing-detail-modal.component';
import { CancelBidModalComponent } from './../cancel-bid-modal/cancel-bid-modal.component';
import { PayOrderModalComponent } from './../pay-order-modal/pay-order-modal.component';
import { ConfirmOrderDeliveredModalComponent } from './../confirm-order-delivered-modal/confirm-order-delivered-modal.component';

@Component({
  //selector: 'app-buy-order-list-item',
  templateUrl: './buy-order-list-item.component.html',
  styleUrls: ['./buy-order-list-item.component.scss']
})
export class BuyOrderListItemComponent implements OnInit {

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openListingDetailModal(): void {
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }

  openCancelBidModal(): void {
    const dialog = this._dialog.open(CancelBidModalComponent);
  }

  openPayOrderModal(): void {
    const dialog = this._dialog.open(PayOrderModalComponent);
  }

  openConfirmOrderDeliveredModal(): void {
    const dialog = this._dialog.open(ConfirmOrderDeliveredModalComponent);
  }

}
