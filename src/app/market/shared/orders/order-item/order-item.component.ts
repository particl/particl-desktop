import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Bid } from '../../../../core/market/api/bid/bid.model';
import { BidService } from 'app/core/market/api/bid/bid.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { SnackbarService } from '../../../../core/snackbar/snackbar.service';
import { PlaceOrderComponent } from '../../../../modals/market-place-order/place-order.component';
import { ShippingComponent } from '../../../../modals/market-shipping/shipping.component';
import { BidConfirmationModalComponent } from 'app/modals/market-bid-confirmation-modal/bid-confirmation-modal.component';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent implements OnInit {

  @Input() order: Bid;
  trackNumber: string;
  country: string = '';
  orderActivity: any = {};
  private itemTitle: string = '';
  private pricing: any = {
    separator: '',
    baseInt: 0,
    baseFraction: 0,
    shippingInt: 0,
    shippingFraction: 0,
    escrowInt: 0,
    escrowFraction: 0,
    totalInt: 0,
    totalFraction: 0
  };
  private _featuredImage: any;
  constructor(
    private bid: BidService,

    // @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
    private modals: ModalsHelperService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {
    console.log('@@@@@@ GOT ORDER: ', this.order);
    if (!this.order) {
      return;
    }
    this.country = this.order.ShippingAddress.country;
    this.itemTitle = this.order.ListingItem
      && this.order.ListingItem.ItemInformation
      && (typeof this.order.ListingItem.ItemInformation.title === 'string') ?
      this.order.ListingItem.ItemInformation.title : '';

    const price = this.order.PricingInformation(this.country);
    this.pricing.separator = price.base.particlStringSep();
    this.pricing.baseInt = price.base.particlStringInteger();
    this.pricing.baseFraction = price.base.particlStringFraction();
    this.pricing.shippingInt = price.shipping.particlStringInteger();
    this.pricing.shippingFraction = price.shipping.particlStringFraction();
    this.pricing.escrowInt = price.escrow.particlStringInteger();
    this.pricing.escrowFraction = price.escrow.particlStringFraction();
    this.pricing.totalInt = price.total.particlStringInteger();
    this.pricing.totalFraction = price.total.particlStringFraction();
    this.orderActivity = this.order.orderActivity;
  }

  get title(): string {
    return this.itemTitle;
  }

  get pricingInfo(): any {
    return this.pricing;
  }

  get listingImage(): string {
    return (this._featuredImage && this._featuredImage.thumbnail) || './assets/images/placeholder_1-1.jpg';
  }

  get primaryActions(): any[] {
    return this.orderActivity.buttons
      ? this.orderActivity.buttons.filter((button: any) => button.primary) : [];
  }

  get secondaryActions(): any[] {
    return this.orderActivity.buttons
      ? this.orderActivity.buttons.filter((button: any) => !button.primary) : [];
  }

  executeAction(actionType: string) {
    console.log('@@@@@ @ executeAction(): ', actionType);
    const valid = actionType &&
      this.orderActivity.buttons &&
      (this.orderActivity.buttons.findIndex((button: any) => !button.disabled && (button.action === actionType) ) !== -1);

    if (valid) {
      this.callBid(actionType.toLowerCase());
    }
  }

  // Testing of all the scenarios
  // order_action() {
  //   switch (this.order.status) {
  //     case 'bidding':
  //       // run accept command for seller
  //       if (this.order.type === 'sell') {
  //         this.callBid('accept')
  //       }
  //       break;

  //     case 'awaiting':
  //       // Escrow lock call with popup
  //       if (this.order.type === 'buy') {
  //         this.openPaymentConfirmationModal();
  //         // this.escrowLock();
  //       }
  //       break;

  //     case 'escrow':
  //       if (this.order.type === 'sell') {
  //         this.callBid('shipping');
  //       }
  //       break;

  //     case 'shipping':
  //       // escrow release call with popup
  //       if (this.order.type === 'buy') {
  //         this.callBid('escrow');
  //       }
  //       break;

  //     default:
  //       break;
  //   }
  // }

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
    this.modals.unlock({timeout: 30}, (status) => {
      this.openProcessingModal();
      this.callAction(type);
    });
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
    this.bid.acceptBidCommand(this.order.id).pipe(take(1)).subscribe(() => {
      this.snackbarService.open(`Order accepted ${this.itemTitle}`);
      // Reload same order without calling api
      this.order.OrderItem.status = 'AWAITING_ESCROW';
      this.order = new Bid(this.order, this.order.type);
      this.dialog.closeAll();
    }, (error) => {
      this.dialog.closeAll();
      this.snackbarService.open(`${error}`);
    });
  }

  rejectBid() {
    this.bid.rejectBidCommand(this.order.id).pipe(take(1)).subscribe(res => {
      this.snackbarService.open(`Order rejected ${this.itemTitle}`);
      this.order.OrderItem.status = 'REJECTED';
      this.order = new Bid(this.order, this.order.type);
      this.dialog.closeAll();
    }, (error) => {
      this.dialog.closeAll();
      this.snackbarService.open(`${error}`);
    });

  }

  escrowRelease(ordStatus: string) {
    this.bid.escrowReleaseCommand(this.order.OrderItem.id, this.trackNumber).pipe(take(1)).subscribe(res => {
      this.snackbarService.open(`Escrow of Order ${this.itemTitle} has been released`);
      this.order.OrderItem.status = ordStatus === 'shipping' ? 'SHIPPING' : 'COMPLETE';
      this.order = new Bid(this.order, this.order.type)
      this.dialog.closeAll();
    }, (error) => {
      this.dialog.closeAll();
      this.snackbarService.open(`${error}`);
    });

  }

  openPaymentConfirmationModal() {
    // @TODO need to be sets trasaction fee.
    const dialogRef = this.dialog.open(BidConfirmationModalComponent);

    dialogRef.componentInstance.bidItem = this.order;
    dialogRef.componentInstance.onConfirm.subscribe(() => {
      // do other action after confirm
      this.modals.unlock({timeout: 30}, (status) => {
        this.openProcessingModal();
        this.escrowLock()
      });
    });
  }

  escrowLock() {
    // <orderItemId> <nonce> <memo> , @TODO send nonce ?
    this.bid.escrowLockCommand(this.order.OrderItem.id, null, 'Release the funds').pipe(take(1)).subscribe(res => {
      this.snackbarService.open(`Payment done for order ${this.itemTitle}`);
      this.order.OrderItem.status = 'ESCROW_LOCKED';
      this.order = new Bid(this.order, this.order.type);
      this.dialog.closeAll();
    }, (error) => {
      this.snackbarService.open(`${error}`);
    });
  }

  openProcessingModal() {
    const dialog = this.dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Hang on, we are busy processing your request'
      }
    });
  }

}
