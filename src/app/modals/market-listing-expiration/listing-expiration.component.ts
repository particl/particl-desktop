import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Amount } from 'app/core/util/utils';
import { TemplateService } from 'app/core/market/api/template/template.service';
import { ListingExpiryConfig } from 'app/modals/models/listingExpiry.modal.config.interface';

interface ListingExpiryIface {
  title: string,
  value: number,
  estimateFee: Amount,
  error?: string,
  isDisabled: boolean
}
@Component({
  selector: 'app-listing-expiration',
  templateUrl: './listing-expiration.component.html',
  styleUrls: ['./listing-expiration.component.scss']
})
export class ListingExpirationComponent {

  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();
  @Output() onCancel: EventEmitter<string> = new EventEmitter<string>();
  txFee: string = '';
  txError: string = '';
  expiration: number = 0;

  expiredList: Array<ListingExpiryIface> = [
    { title: '1 day', value: 1, estimateFee: new Amount(0), isDisabled: false },
    { title: '2 days', value: 2, estimateFee: new Amount(0), isDisabled: false },

    /**
     * @TODO remove the 1 day and 2 days options and enable to other options.
     * as corrently its gryed out for a while the commented code once smsg issue goes fixed.
     *
     */

    { title: '4 days', value: 4, estimateFee: new Amount(0), isDisabled: true },
    { title: '1 week', value: 7, estimateFee: new Amount(0), isDisabled: true },
    { title: '2 weeks', value: 14, estimateFee: new Amount(0), isDisabled: true },
    { title: '3 weeks', value: 21, estimateFee: new Amount(0), isDisabled: true },
    { title: '4 weeks', value: 28, estimateFee: new Amount(0), isDisabled: true }
  ];
  callback: Function;

  constructor(
    private dialogRef: MatDialogRef<ListingExpirationComponent>,
    private templateService: TemplateService
  ) { }

  confirm(): void {

    if (this.callback) {
      this.callback(this.expiration);
    }

    this.onConfirm.emit();
    this.dialogClose();
  }

  dialogClose(): void {
    this.onCancel.emit();
    this.dialogRef.close();
  }

  setData(data: ListingExpiryConfig, callback: Function): void {
    this.callback = callback;
    for (const expiredItem of this.expiredList) {
      if (!expiredItem.isDisabled && expiredItem.value > 0) {
        this.templateService
          .post(data.template, 1, expiredItem.value, true)
          .toPromise().then(
            resp => {
              if (+resp.fee > 0) {
                expiredItem.estimateFee = new Amount(+resp.fee);
                if (this.expiration === expiredItem.value) {
                  this.loadTransactionFee();
                }
              }
            }, err => {
              expiredItem.error = 'Unable to obtain estimate';
            }
          ).catch(
            err => {
              // nothing to do, leave the estimate as not being set
            }
          );
      }
    }
  }

  loadTransactionFee() {
    const expiryItem = this.expiredList.find((val) => +val.value === this.expiration);
    this.txFee = expiryItem ?
      `${expiryItem.estimateFee.getIntegerPart()}${expiryItem.estimateFee.dot()}${expiryItem.estimateFee.getFractionalPart()}` :
      '';
    this.txError = expiryItem ? (expiryItem.error || '') : 'unknown';
  }

}
