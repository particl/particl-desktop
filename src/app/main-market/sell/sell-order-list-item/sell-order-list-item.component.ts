import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingDetailModalComponent } from './../../shared/listing-detail-modal/listing-detail-modal.component';
import { AcceptBidModalComponent } from './../accept-bid-modal/accept-bid-modal.component';
import { RejectBidModalComponent } from './../reject-bid-modal/reject-bid-modal.component';
import { EscrowPaymentModalComponent } from './../escrow-payment-modal/escrow-payment-modal.component';
import { OrderShippedModalComponent } from './../order-shipped-modal/order-shipped-modal.component';

@Component({
  selector: 'app-sell-order-list-item',
  templateUrl: './sell-order-list-item.component.html',
  styleUrls: ['./sell-order-list-item.component.scss']
})
export class SellOrderListItemComponent implements OnInit {

  constructor(
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  openListingDetailModal(): void {
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }

  openAcceptBidModal(): void {
    const dialog = this._dialog.open(AcceptBidModalComponent);
  }

  openRejectBidModal(): void {
    const dialog = this._dialog.open(RejectBidModalComponent);
  }

  openEscrowPaymentModal(): void {
    const dialog = this._dialog.open(EscrowPaymentModalComponent);
  }

  openOrderShippedModal(): void {
    const dialog = this._dialog.open(OrderShippedModalComponent);
  }

}
