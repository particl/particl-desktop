import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Amount } from 'app/core/util/utils';

@Component({
  selector: 'app-listing-exipry',
  templateUrl: './listing-exipry.component.html',
  styleUrls: ['./listing-exipry.component.scss']
})
export class ListingExipryComponent {

  @Output() onConfirm: EventEmitter<string> = new EventEmitter<string>();
  @Output() onCancel: EventEmitter<string> = new EventEmitter<string>();
  txFee: Amount = new Amount(0);
  expiration: number = 0;

  expiredList: Array<any> = [
    { title: 'Select expiry time', value: 0 },
    { title: '4 day', value: 4 },
    { title: '1 week', value: 7 },
    { title: '2 weeks', value: 14 },
    { title: '3 weeks', value: 21 },
    { title: '4 weeks', value: 28 }
  ];
  callback: Function;

  constructor(
    private dialogRef: MatDialogRef<ListingExipryComponent>
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

  setData(callback: Function): void {
    this.callback = callback;
  }

  loadTransactionFee() {
    /* @TODO transaction fee will be calculated from backend
     * currently we have assumed days_retention=1 costs 0.26362200
     */
    this.txFee = new Amount(0.26362200 * this.expiration)
  }

}
