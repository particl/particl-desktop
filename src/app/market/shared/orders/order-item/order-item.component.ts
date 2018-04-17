import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Bid } from '../../../../core/market/api/bid/bid.model';

import { BidService } from 'app/core/market/api/bid/bid.service';
import { ListingService } from '../../../../core/market/api/listing/listing.service';

import { ModalsService } from 'app/modals/modals.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';

import { PlaceOrderComponent } from '../../../../modals/place-order/place-order.component';
import { ShippingComponent } from '../../../../modals/shipping/shipping.component';
import { SnackbarService } from '../../../../core/snackbar/snackbar.service';
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
    private dialog: MatDialog,
    private snackbarService: SnackbarService
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
          this.callBid('accept')
        }
        break;

      case 'Awaiting (Escrow)':
        // Escrow lock call with popup
        if (this.order.type === 'buy') {
          this.callBid('escrowLock');
        }
        break;

      case 'Escrow':
        if (this.order.type === 'sell') {
          this.callBid('escrow');
        }
        break;

      case 'Shipping':
        // escrow release call with popup
        if (this.order.type === 'buy') {
          this.callBid('shipping');
        }
        break;

      default:
        break;
    }
  }

  // @TODO: refactor method for all calls
  callBid(type: string) {
    const dialogRef = this.dialog.open(type === 'shipping' ? ShippingComponent : PlaceOrderComponent);
    dialogRef.componentInstance.type = type;
    dialogRef.componentInstance.isConfirmed.subscribe(() => this.checkForWallet(type));
  }

  checkForWallet(type: string) {
    if (this.rpcState.get('locked')) {
      // unlock wallet and send transaction
      this.modals.open('unlock', {forceOpen: true, timeout: 30, callback: this.callAction.bind(this, type)});
    } else {
      // wallet already unlocked
      this.callAction(type);
    }
  }

  callAction(type: string) {
    if (type === 'accept') {
      this.acceptBid();
    } else if (type === 'reject') {
      this.rejectBid();
    } else if (type === 'escrow') {
      // Escrow Release Command
      this.escrowRelease();
    } else if (type === 'escrowLock') {
      // Escrow lock command
    }
  }

  acceptBid() {
    this.bid.acceptBidCommand(this.order.listing.hash, this.order.id).take(1).subscribe(() => {
      this.snackbarService.open(`Order accepted ${this.order.listing.title}`);
    }, (error) => {
      this.snackbarService.open(`${error}`);
    });
  }

  rejectBid() {
    this.bid.rejectBidCommand(this.order.listing.hash, this.order.id).take(1).subscribe(res => {
      this.snackbarService.open(`Order rejected ${this.order.listing.title}`);
    }, (error) => {
      this.snackbarService.open(`${error}`);
    });

  }

  // Not sure if memo is required = 'Release the funds, greetings buyer'
  escrowRelease() {
    this.bid.escrowReleaseCommand(this.order.id, 'Release the funds, greetings buyer').take(1).subscribe(res => {
      this.snackbarService.open(`Escrow of Order ${this.order.listing.title} has been released`);
    }, (error) => {
      this.snackbarService.open(`${error}`);
    });

  }

}
