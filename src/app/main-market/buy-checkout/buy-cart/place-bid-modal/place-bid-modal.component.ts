import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { WalletUTXOState } from 'app/main/store/main.state';

import { AnonUTXO } from 'app/main/store/main.models';
import { isBasicObjectType, getValueOrDefault } from '../../../shared/utils';
import { PartoshiAmount } from 'app/core/util/utils';


interface PriceItem {
  whole: string;
  sep: string;
  fraction: string;
}


interface ErrorTypes {
  insufficientFunds: boolean;
  insufficientUtxos: boolean;
  invalidData: boolean;
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
    }
  };

  readonly errors: ErrorTypes = {
    insufficientFunds: true,
    insufficientUtxos: false,
    invalidData: false
  };

  private destroy$: Subject<void> = new Subject();


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BidModalData,
    private _dialogRef: MatDialogRef<PlaceBidModalComponent>,
    private _store: Store
  ) {

    // extraction of input data
    if (isBasicObjectType(this.data)) {
      if (Object.prototype.toString.call(this.data.items) === '[object Array]') {
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
        if (Object.prototype.toString.call(this.data.shippingDetails.address) === '[object Array]') {
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
    }

    // validation of extracted info
    this.errors.invalidData = (this.summary.items.length === 0) ||
        (this.summary.shippingDetails.address.length === 0) ||
        (this.summary.pricingSummary.orderTotal.whole.length === 0);
  }


  ngOnInit() {
    this._store.select(WalletUTXOState.getValue('anon')).pipe(
      map((utxos: AnonUTXO[]) => {
        const totalSpendable = new PartoshiAmount(0);

        for (const utxo of utxos) {
          let spendable = true;
          if ('spendable' in utxo) {
            spendable = utxo.spendable;
          }
          if ((!utxo.coldstaking_address || utxo.address) && spendable) {
            totalSpendable.add(new PartoshiAmount(utxo.amount));
          }
        }

        const requiredBalance = +`${this.summary.pricingSummary.orderTotal.whole}${this.summary.pricingSummary.orderTotal.sep}${this.summary.pricingSummary.orderTotal.fraction}` || 0;
        this.errors.insufficientFunds = !this.errors.invalidData && (requiredBalance > totalSpendable.particls());
        this.errors.insufficientUtxos = !this.errors.insufficientFunds && (this.summary.items.length > utxos.length);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  confirmCheckout(): void {
    if (this.errors.invalidData) {
      return;
    }
    this._dialogRef.close(true);
  }
}
