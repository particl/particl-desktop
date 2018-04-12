import {Component, Input, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Bid } from '../../../../core/market/api/bid/bid.model';

import { BidService } from 'app/core/market/api/bid/bid.service';
import { ListingService } from '../../../../core/market/api/listing/listing.service';

import { ModalsService } from 'app/modals/modals.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';

import { PlaceOrderComponent } from '../../../../modals/place-order/place-order.component';
@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent implements OnInit {

  @Input() order: Bid;

  constructor(
    private listingService: ListingService,
    private bid: BidService,
    private rpcState: RpcStateService,
    private modals: ModalsService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getItemDetails()
  }

  getItemDetails() {
    this.listingService.get(this.order.listingItemId).subscribe(response => {
     this.order.listing = response;
    });
  }

  // Testing of all the scenarios
  order_action() {
    switch (this.order.status) {
      case 'Bidding':
        // run accept command for seller
        if (this.order.type === 'sell') {
          this.openPopup()
        }
        break;

      case 'Awaiting':
        // Awaiting call
        break;

      case 'Escrow':
        // Escrow release call
        break;

      case 'Shipping':
        // shipping call
        break;

      default:
        // code...
        break;
    }
  }

  openPopup() {
    const dialogRef = this.dialog.open(PlaceOrderComponent);
    dialogRef.componentInstance.type = 'accept';
    dialogRef.componentInstance.isConfirmed.subscribe(() => this.checkForWallet());
  }

  checkForWallet() {
    if (this.rpcState.get('locked')) {
      // unlock wallet and send transaction
      this.modals.open('unlock', {forceOpen: true, timeout: 30, callback: this.acceptBid.bind(this)});
    } else {
      // wallet already unlocked
      this.acceptBid();
    }
  }

  acceptBid() {
    this.bid.acceptBidCommand(this.order.listing.hash, this.order.id).subscribe(res => console.log(res));
  }

}
