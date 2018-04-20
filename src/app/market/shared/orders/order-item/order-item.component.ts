import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { Bid } from '../../../../core/market/api/bid/bid.model';
import { setOrderKeys } from 'app/core/util/utils';
import { BidService } from 'app/core/market/api/bid/bid.service';
import { ListingService } from '../../../../core/market/api/listing/listing.service';

import { ModalsService } from 'app/modals/modals.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';

import { PlaceOrderComponent } from '../../../../modals/place-order/place-order.component';
import { ShippingComponent } from '../../../../modals/shipping/shipping.component';
import { SnackbarService } from '../../../../core/snackbar/snackbar.service';
import { SendConfirmationModalComponent } from '../../../../wallet/wallet/send/send-confirmation-modal/send-confirmation-modal.component';
@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent implements OnInit {

  @Input() order: Bid;
  trackNumber: string;
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
          this.openPaymentConfirmationModal();
          // this.escrowLock();
        }
        break;

      case 'Escrow':
        if (this.order.type === 'sell') {
          this.callBid('shipping');
        }
        break;

      case 'Shipping':
        // escrow release call with popup
        if (this.order.type === 'buy') {
          this.callBid('escrow');
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
    dialogRef.componentInstance.isConfirmed.subscribe((res: any) => {
      this.trackNumber = res ? res : '';
      this.checkForWallet(type);
    });
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
    } else {
      // Escrow Release Command
      this.escrowRelease(type);
    }
  }

  acceptBid() {
    this.bid.acceptBidCommand(this.order.listing.hash, this.order.id).take(1).subscribe(() => {
      this.snackbarService.open(`Order accepted ${this.order.listing.title}`);
      // Reload same order without calling api
      this.order.OrderItem.status = 'AWAITING_ESCROW';
      this.order = setOrderKeys(this.order, this.order.type)
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

  escrowRelease(ordStatus: string) {
    this.bid.escrowReleaseCommand(this.order.OrderItem.id, this.trackNumber).take(1).subscribe(res => {
      this.snackbarService.open(`Escrow of Order ${this.order.listing.title} has been released`);
      this.order.OrderItem.status = ordStatus === 'escrow' ? 'SHIPPING' : 'COMPLETE';
      this.order = setOrderKeys(this.order, this.order.type)
    }, (error) => {
      this.snackbarService.open(`${error}`);
    });

  }

  openPaymentConfirmationModal() {
    // @TODO need to be sets trasaction fee.
    const dialogRef = this.dialog.open(SendConfirmationModalComponent);

    dialogRef.componentInstance.type = 'bid';
    dialogRef.componentInstance.bidItem = this.order;
    dialogRef.componentInstance.onConfirm.subscribe(() => {
      // do other action after confirm
      this.escrowLock();
    });
  }

  escrowLock() {
    // <orderItemId> <nonce> <memo> , @TODO send nonce ?
    this.bid.escrowLockCommand(this.order.OrderItem.id, null, 'Release the funds').take(1).subscribe(res => {
      this.snackbarService.open(`Payment done for order ${this.order.listing.title}`);
      this.order.OrderItem.status = 'ESCROW_LOCKED';
      this.order = setOrderKeys(this.order, this.order.type)
    }, (error) => {
      this.snackbarService.open(`${error}`);
    });
  }

}
