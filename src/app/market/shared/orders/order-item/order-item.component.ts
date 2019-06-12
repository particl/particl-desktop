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
import { OrderData } from 'app/core/util/utils';

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
  private purchaseMemo: string = '';
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

    this.purchaseMemo = this.order.ListingItem && this.order.ListingItem.memo ? this.order.ListingItem.memo : this.purchaseMemo;

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

    const imageList: any[] = (this.order.ListingItem.ItemInformation || {}).ItemImages || [];
    this._featuredImage = new Image(imageList.length ? imageList[0] : { ItemImageDatas: [] });
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

  get memo(): string {
    return this.purchaseMemo;
  }

  executeAction(actionType: string) {
    console.log('@@@@@ @ executeAction(): ', actionType);
    const valid = actionType &&
      this.orderActivity.buttons &&
      (this.orderActivity.buttons.findIndex((button: any) => !button.disabled && (button.action === actionType) ) !== -1);

    if (valid) {
      this.callBid(actionType);
    }
  }

  private callBid(action: string) {

    // Open appropriate confirmation modal
    let dialogRef;
    switch (action) {
      case 'LOCK_ESCROW':
        dialogRef = this.dialog.open(BidConfirmationModalComponent);
        dialogRef.componentInstance.bidItem = this.order;
        break;
      case 'SHIP_ITEM':
        dialogRef = this.dialog.open(ShippingComponent);
        // dialogRef.componentInstance.type = action.toLowerCase();
        break;
      default:
        dialogRef = this.dialog.open(PlaceOrderComponent);
        dialogRef.componentInstance.type = action.toLowerCase();
    }
    dialogRef.componentInstance.isConfirmed.subscribe((res: any) => {

      // processing confirmed, take the correct action

      // unlock the wallet if applicable
      this.modals.unlock({timeout: 30}, (status) => {
        this.openProcessingModal();

        let resp: Promise<void>;
        if (action === 'ACCEPT') {
          resp = this.acceptBid();
        } else if (action === 'REJECT') {
          resp = this.rejectBid();
        } else if (action === 'LOCK_ESCROW') {
          resp = this.escrowLock(res);
        } else if (action === 'COMPLETE_ESCROW') {
          resp = this.escrowComplete();
        } else if (action === 'SHIP_ITEM') {
          resp = this.shipItem(res);
        } else if (action === 'COMPLETE') {
          resp = this.escrowRelease();
        }

        if (resp) {
          resp.then(() => {
            const nextStep = Object.keys(OrderData).find((key) => OrderData[key].from_action === action);
            if (nextStep) {
              this.order.OrderItem.status = OrderData[nextStep].orderStatus;
            }
            this.order = new Bid(this.order, this.order.type);
            this.dialog.closeAll();
          }).catch(error => {
              this.dialog.closeAll();
              this.snackbarService.open(`${error}`);
          });
        }
      });
    });
  }

  private async acceptBid(): Promise<void> {
    return this.bid.acceptBidCommand(this.order.id).pipe(take(1)).toPromise().then(() => {
      this.snackbarService.open(`Order accepted ${this.itemTitle}`);
    });
  }

  private async rejectBid(): Promise<void> {
    return this.bid.rejectBidCommand(this.order.id).pipe(take(1)).toPromise().then(() => {
      this.snackbarService.open(`Order rejected: ${this.itemTitle}`);
    });
  }

  private async escrowLock(data: any): Promise<void> {
    const contactDetails = []; // TODO: check and use the data from the modal (contained in 'data')
    return this.bid.escrowLockCommand(this.order.OrderItem.id, contactDetails).pipe(take(1)).toPromise().then(() => {
      this.snackbarService.open(`Payment made for order ${this.itemTitle}`);
    });
  }

  private async escrowComplete(): Promise<void> {
    return this.bid.escrowCompleteCommand(this.order.OrderItem.id).pipe(take(1)).toPromise().then(() => {
      this.snackbarService.open(`Escrow has been completed for order ${this.itemTitle}`);
    });
  }

  private async shipItem(data: any | string): Promise<void> {
    const memo = typeof data === 'string' ? data : '';
    return this.bid.shippingCommand(this.order.OrderItem.id, memo).pipe(take(1)).toPromise().then(() => {
      this.snackbarService.open(`Escrow has been completed for order ${this.itemTitle}`);
    });
  }

  private async escrowRelease(): Promise<void> {
    return this.bid.escrowReleaseCommand(this.order.OrderItem.id, this.trackNumber).pipe(take(1)).toPromise().then(() => {
      this.snackbarService.open(`Escrow of order ${this.itemTitle} has been released`);
    });
  }

  openProcessingModal() {
    const dialog = this.dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Please wait while your action is processed'
      }
    });
  }

}
