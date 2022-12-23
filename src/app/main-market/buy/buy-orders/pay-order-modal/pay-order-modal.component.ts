import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

import { isBasicObjectType, getValueOrDefault } from '../../../shared/utils';
import { GenericOrderModalInputs, OrderModalResponse } from '../../../services/orders/orders.models';
import { PriceItem, BID_DATA_KEY } from '../../../shared/market.models';


@Component({
  templateUrl: './pay-order-modal.component.html',
  styleUrls: ['./pay-order-modal.component.scss']
})
export class PayOrderModalComponent {

  readonly itemPricing: PriceItem;
  readonly listingTitle: string;
  readonly orderHash: string;

  inputContactPhone: FormControl = new FormControl('', Validators.maxLength(25));
  inputContactEmail: FormControl = new FormControl('', Validators.maxLength(250));


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericOrderModalInputs,
    private _dialogRef: MatDialogRef<PayOrderModalComponent>,
  ) {
    let orderHash = '';
    let listingTitle = '';
    const itemPricing: PriceItem = {
      whole: '',
      sep: '',
      fraction: ''
    };

    if (isBasicObjectType(this.data) && isBasicObjectType(this.data.orderItem)) {
      orderHash = getValueOrDefault(this.data.orderItem.orderHash, 'string', orderHash);

      if (isBasicObjectType(this.data.orderItem.pricing)) {
        itemPricing.whole = this.data.orderItem.pricing.totalRequired.whole;
        itemPricing.sep = this.data.orderItem.pricing.totalRequired.sep;
        itemPricing.fraction = this.data.orderItem.pricing.totalRequired.fraction;
      }

      if (isBasicObjectType(this.data.orderItem.listing)) {
        listingTitle = getValueOrDefault(this.data.orderItem.listing.title, 'string', listingTitle);
      }
    }

    this.itemPricing = itemPricing;
    this.listingTitle = listingTitle;
    this.orderHash = orderHash;
  }


  doAction() {
    if (!this.inputContactPhone.valid || !this.inputContactEmail.valid) {
      return;
    }

    const modalResponse: OrderModalResponse = {
      doAction: true,
      params: {}
    };

    if (this.inputContactEmail.value) {
      modalResponse.params[BID_DATA_KEY.DELIVERY_EMAIL] = this.inputContactEmail.value;
    }
    if (this.inputContactPhone.value) {
      modalResponse.params[BID_DATA_KEY.DELIVERY_PHONE] = this.inputContactPhone.value;
    }

    this._dialogRef.close(modalResponse);
  }

}
