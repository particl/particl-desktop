import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { WalletBalanceState } from 'app/main/store/main.state';

import { PriceItem } from '../../../shared/market.models';
import { isBasicObjectType, getValueOrDefault } from '../../../shared/utils';


interface ErrorTypes {
  insufficientFunds: boolean;
  insufficientUtxos: boolean;
  invalidData: boolean;
  unconfirmedCustomEscow: boolean;
}

export interface BidModalData {
  items: {
    itemName: string;
    itemImg: string;
  }[];
  shippingDetails: {
    name: string;
    address: string[];
    destinationCountryCode: string;
  };
  pricingSummary: {
    items: PriceItem;
    shipping: PriceItem;
    subtotal: PriceItem;
    escrow: PriceItem;
    orderTotal: PriceItem;
  };
  escrow: {
    includesCustomEscrow: boolean;
  }
}


@Component({
  templateUrl: './place-bid-modal.component.html',
  styleUrls: ['./place-bid-modal.component.scss']
})
export class PlaceBidModalComponent implements OnInit, OnDestroy {

  readonly summary: BidModalData = {
    items: [],
    shippingDetails: {
      name: '',
      address: [],
      destinationCountryCode: ''
    },
    pricingSummary: {
      items: { whole: '', sep: '', fraction: '' },
      shipping: { whole: '', sep: '', fraction: '' },
      subtotal: { whole: '', sep: '', fraction: '' },
      escrow: { whole: '', sep: '', fraction: '' },
      orderTotal: { whole: '', sep: '', fraction: '' },
    },
    escrow: {
      includesCustomEscrow: false,
    }
  };

  readonly errors: ErrorTypes = {
    insufficientFunds: true,
    insufficientUtxos: false,
    invalidData: false,
    unconfirmedCustomEscow: false,
  };

  private destroy$: Subject<void> = new Subject();


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BidModalData,
    private _dialogRef: MatDialogRef<PlaceBidModalComponent>,
    private _store: Store
  ) {

    // extraction of input data
    if (isBasicObjectType(this.data)) {
      if (Array.isArray(this.data.items)) {
        this.data.items.forEach(item => {
          if (
            item &&
            (typeof item.itemName === 'string') && (item.itemName.length > 0) &&
            (typeof item.itemImg === 'string') && (item.itemImg.length > 0)
          ) {
            this.summary.items.push({itemName: item.itemName, itemImg: item.itemImg});
          }
        });
      }

      if (isBasicObjectType(this.data.shippingDetails)) {
        this.summary.shippingDetails.name = getValueOrDefault(this.data.shippingDetails.name, 'string', this.summary.shippingDetails.name);
        this.summary.shippingDetails.destinationCountryCode = getValueOrDefault(
          this.data.shippingDetails.destinationCountryCode, 'string', this.summary.shippingDetails.destinationCountryCode
        );
        if (Array.isArray(this.data.shippingDetails.address)) {
          this.data.shippingDetails.address.forEach(addrLine => {
            if (typeof addrLine === 'string') {
              this.summary.shippingDetails.address.push(addrLine);
            }
          });
        }
      }

      if (isBasicObjectType(this.data.pricingSummary)) {
        const pricingKeys = Object.keys(this.summary.pricingSummary);
        for (const pricingKey of pricingKeys) {
          if (isBasicObjectType(this.data.pricingSummary[pricingKey])) {
            const segmentKeys = Object.keys(this.summary.pricingSummary[pricingKey]);
            for (const segmentKey of segmentKeys) {
              if (typeof this.summary.pricingSummary[pricingKey][segmentKey] === typeof this.data.pricingSummary[pricingKey][segmentKey]) {
                this.summary.pricingSummary[pricingKey][segmentKey] = this.data.pricingSummary[pricingKey][segmentKey];
              }
            }
          }
        }
      }

      if (isBasicObjectType(this.data.escrow)) {
        if (typeof this.data.escrow.includesCustomEscrow === 'boolean') {
          this.summary.escrow.includesCustomEscrow = this.data.escrow.includesCustomEscrow;

          this.errors.unconfirmedCustomEscow = this.summary.escrow.includesCustomEscrow;
        }
      }
    }

    // validation of extracted info
    this.errors.invalidData = (this.summary.items.length === 0) ||
      (this.summary.shippingDetails.address.length === 0) ||
      (this.summary.pricingSummary.orderTotal.whole.length === 0);
  }


  ngOnInit() {
    this._store.select(WalletBalanceState.spendableAmountAnon()).pipe(
      tap((amount) => {
        const requiredBalance = +`${this.summary.pricingSummary.orderTotal.whole}${this.summary.pricingSummary.orderTotal.sep}${this.summary.pricingSummary.orderTotal.fraction}` || 0;
        this.errors.insufficientFunds = !this.errors.invalidData && (requiredBalance > +amount);
        this.errors.insufficientUtxos =
          !this.errors.insufficientFunds &&
          (this.summary.items.length > this._store.selectSnapshot(WalletBalanceState.utxosAnon()).length);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  confirmCheckout(): void {
    if (this.errors.invalidData || this.errors.unconfirmedCustomEscow) {
      return;
    }
    this._dialogRef.close(true);
  }
}
