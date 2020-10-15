import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';
import { isBasicObjectType, getValueOrDefault } from '../../../shared/utils';
import { GenericOrderModalInputs, OrderModalResponse } from '../../../services/orders/orders.models';
import { PriceItem } from '../../../shared/market.models';


@Component({
  templateUrl: './escrow-payment-modal.component.html',
  styleUrls: ['./escrow-payment-modal.component.scss']
})
export class EscrowPaymentModalComponent {

  @Select(CoreConnectionState.isTestnet) isTestnet: Observable<boolean>;

  readonly itemPricing: PriceItem;
  readonly listingTitle: string;
  readonly orderHash: string;

  escrowMemo: FormControl = new FormControl('', Validators.maxLength(250));

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericOrderModalInputs,
    private _dialogRef: MatDialogRef<EscrowPaymentModalComponent>,
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

    this.orderHash = orderHash;
    this.itemPricing = itemPricing;
    this.listingTitle = listingTitle;

  }


  doAction() {
    if (!this.escrowMemo.valid) {
      return;
    }

    const modalResponse: OrderModalResponse = {
      doAction: true,
      params: {}
    };

    if (this.escrowMemo.value) {
      modalResponse.params.memo = this.escrowMemo.value;
    }

    this._dialogRef.close(modalResponse);
  }

}
