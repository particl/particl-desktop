import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Bid } from '../../../../core/market/api/bid/bid.model';
import { BidService } from 'app/core/market/api/bid/bid.service';
import { ModalsHelperService } from 'app/modals/modals.module';
import { SnackbarService } from '../../../../core/snackbar/snackbar.service';
import { PlaceOrderComponent } from '../../../../modals/market-place-order/place-order.component';
import { ShippingComponent } from '../../../../modals/market-shipping/shipping.component';
import { BidRejectComponent } from '../../../../modals/bid-reject/bid-reject.component';
import { BID_REJECT_MESSAGES } from '../../../../modals/bid-reject/bid-reject-messages';
import { BidConfirmationModalComponent } from 'app/modals/market-bid-confirmation-modal/bid-confirmation-modal.component';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';
import { take } from 'rxjs/operators';
import { OrderData } from 'app/core/util/utils';
import { Image } from 'app/core/market/api/template/image/image.model';
import { isPlainObject } from 'lodash';
import { BidCancelComponent } from 'app/modals/bid-cancel/bid-cancel.component';
import { SettingsStateService } from 'app/settings/settings-state.service';

@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent implements OnInit {

  @Output() onOrderUpdated: EventEmitter<any> = new EventEmitter<any>();
  @Input() order: Bid;
  trackNumber: string;
  country: string = '';
  orderActivity: any = {};
  contactDetails: any = {
    phone: '',
    email: ''
  };
  additionalInfo: any = {
    transactionID: '',
    rejectMessage: ''
  };
  showShippingInfo: boolean = false;
  private itemTitle: string = '';
  private purchaseMemo: string = '';
  private pricing: any = {
    separator: '.',
    baseInt: 0,
    baseFraction: 0,
    shippingInt: 0,
    shippingFraction: 0,
    escrowInt: 0,
    escrowFraction: 0,
    totalInt: 0,
    totalFraction: 0
  };
  private _featuredImage: string;
  constructor(
    private bid: BidService,

    private modals: ModalsHelperService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private _settings: SettingsStateService
  ) { }

  ngOnInit() {
    if (!this.order) {
      return;
    }
    this.country = this.order.ShippingAddress.country;
    this.itemTitle = this.order.ListingItem
      && this.order.ListingItem.ItemInformation
      && (typeof this.order.ListingItem.ItemInformation.title === 'string') ?
      this.order.ListingItem.ItemInformation.title : '';

    let _memo = '';
    if (Object.prototype.toString.call(this.order.ChildBids) === '[object Array]' ) {
      const shipBid = this.order.ChildBids.find((fb: any) => fb.type === 'MPA_SHIP' );
      if (shipBid) {
        const memoDatas = shipBid.BidDatas.find((bd: any) => bd.key === 'shipping.memo');
        if (memoDatas) {
          _memo = String(memoDatas.value);
        }
      }
      const lockBid = this.order.ChildBids.find((fb: any) => fb.type === 'MPA_LOCK' );
      if (lockBid) {
        for (const data of (lockBid.BidDatas || []) ) {
          if (data && data.key && (<string>data.key).startsWith('delivery.')) {
            this.contactDetails[(<string>data.key).replace('delivery.', '')] = String(data.value);
          }
        }
      }

      const completeBid = this.order.ChildBids.find((fb: any) => fb.type === 'MPA_COMPLETE' );
      if (completeBid) {
        for (const data of (completeBid.BidDatas || []) ) {
          if (data && data.key && (<string>data.key) === 'txid.complete') {
            this.additionalInfo.transactionID = String(data.value);
          }
        }
      }

      const rejectBid = this.order.ChildBids.find((fb: any) => fb.type === 'MPA_REJECT' );
      if (rejectBid) {
        const datas = rejectBid.BidDatas.find((bd: any) => bd.key === 'reject.reason');
        if (datas) {
          if (BID_REJECT_MESSAGES[String(datas.value)]) {
            this.additionalInfo.rejectMessage = BID_REJECT_MESSAGES[String(datas.value)].text || '';
          }
        }
        if (!this.additionalInfo.rejectMessage.length) {
          this.additionalInfo.rejectMessage = 'Unspecified Reason'
        }
      }
    }
    this.purchaseMemo = _memo;

    this.showShippingInfo = this.order.type === 'buy' && ['shipping', 'complete'].includes(this.order.step);

    const price = this.order.PricingInformation(this.country);
    this.pricing.baseInt = price.base.particlStringInteger();
    this.pricing.baseFraction = price.base.particlStringFraction();
    this.pricing.baseSep = price.base.particlStringSep();
    this.pricing.shippingInt = price.shipping.particlStringInteger();
    this.pricing.shippingFraction = price.shipping.particlStringFraction();
    this.pricing.shippingSep = price.shipping.particlStringSep();
    this.pricing.escrowInt = price.escrow.particlStringInteger();
    this.pricing.escrowFraction = price.escrow.particlStringFraction();
    this.pricing.escrowSep = price.escrow.particlStringSep();
    this.pricing.totalInt = price.total.particlStringInteger();
    this.pricing.totalFraction = price.total.particlStringFraction();
    this.pricing.totalSep = price.total.particlStringSep();
    this.orderActivity = this.order.orderActivity;

    const imageList: any[] = (this.order.ListingItem.ItemInformation || {}).ItemImages || [];
    const selectedImage = new Image(imageList.length ? imageList[0] : { ItemImageDatas: [] });


    const pathparts = String(selectedImage.thumbnail).split(':');
    if (pathparts.length === 1) {
      this._featuredImage = pathparts[0];
    } else {
      const mpPort = this._settings.get('settings.market.env.port');
      this._featuredImage = `http://localhost:${mpPort}/${pathparts[pathparts.length - 1].split('/').slice(1).join('/')}`;
    }
  }

  get title(): string {
    return this.itemTitle;
  }

  get pricingInfo(): any {
    return this.pricing;
  }

  get listingImage(): string {
    return this._featuredImage;
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

  executeAction(actionable: any) {
    const actionType = actionable.action;
    const valid = actionType &&
      this.orderActivity.buttons &&
      (this.orderActivity.buttons.findIndex((button: any) => !button.disabled && (button.action === actionType) ) !== -1);

    if (valid) {
      this.callBid(actionable);
    }
  }

  private callBid(actionable: any) {
    // Prevent double clicking of the button
    actionable.locked = true;

    const action = actionable.action;
    // Open appropriate confirmation modal
    let dialogRef;
    switch (action) {
      case 'LOCK_ESCROW':
        dialogRef = this.dialog.open(BidConfirmationModalComponent);
        dialogRef.componentInstance.bidItem = this.order;
        break;
      case 'SHIP_ITEM':
        dialogRef = this.dialog.open(ShippingComponent);
        break;
      case 'REJECT':
        dialogRef = this.dialog.open(BidRejectComponent);
        break;
      case 'CANCEL':
        dialogRef = this.dialog.open(BidCancelComponent);
        break;
      default:
        dialogRef = this.dialog.open(PlaceOrderComponent);
        dialogRef.componentInstance.type = action.toLowerCase();
    }

    dialogRef.afterClosed().subscribe(() => {
      actionable.locked = false;
    });

    dialogRef.componentInstance.isConfirmed.subscribe((res: any) => {

      // processing confirmed, take the correct action

      // unlock the wallet if applicable
      this.modals.unlock({timeout: 30}, (status) => {
        this.openProcessingModal();

        let resp: Promise<void>;
        if (action === 'ACCEPT') {
          resp = this.acceptBid();
        } else if (action === 'REJECT') {
          resp = this.rejectBid(res);
        } else if (action === 'LOCK_ESCROW') {
          resp = this.escrowLock(res);
        } else if (action === 'COMPLETE_ESCROW') {
          resp = this.escrowComplete();
        } else if (action === 'SHIP_ITEM') {
          resp = this.shipItem(res);
        } else if (action === 'COMPLETE') {
          resp = this.escrowRelease();
        } else if (action === 'CANCEL') {
          resp = this.cancelBid();
        }

        if (resp) {
          resp.then(() => {
            const nextStep = Object.keys(OrderData).find((key) => OrderData[key].from_action === action);
            if (nextStep) {
              const newStatus = String(OrderData[nextStep].orderStatus) || '';
              this.order.OrderItem.status = newStatus;
              this.order = new Bid(this.order, this.order.type);
              this.orderActivity = this.order.orderActivity;
            }
            this.dialog.closeAll();
            setTimeout(() => this.onOrderUpdated.emit({}), 300);
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

  private async rejectBid(data: any): Promise<void> {
    let reason: string | null = null;
    if (typeof data === 'string' && isPlainObject(BID_REJECT_MESSAGES[data])) {
      reason = String(data);
    }
    return this.bid.rejectBidCommand(this.order.id, reason).pipe(take(1)).toPromise().then(() => {
      this.snackbarService.open(`Order rejected: ${this.itemTitle}`);
    });
  }

  private async cancelBid(): Promise<void> {
    return this.bid.cancelBidCommand(this.order.id).pipe(take(1)).toPromise().then(() => {
      this.snackbarService.open(`Order cancelled ${this.itemTitle}`);
    });
  }

  private async escrowLock(data: any): Promise<void> {
    const contactDetails: string[] = [];
    const deliveryDetails = ['phone', 'email'];
    for (const deliveryKey of deliveryDetails) {
      if (data && data[deliveryKey]) {
        contactDetails.push(`delivery.${deliveryKey}`);
        contactDetails.push( String(data[deliveryKey]) );
      }
    };

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
    this.dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Please wait while your action is processed'
      }
    });
  }

}
