import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-shipping-order',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent implements OnInit {
  public type: string = '';
  trackingNumber: string = '';
  isPrerelease: boolean = false;
  @Output() isConfirmed: EventEmitter<string> = new EventEmitter();
  constructor(public _dialogRef: MatDialogRef<ShippingComponent>) { }

  ngOnInit() {
  }

  placeOrder(): void {
    this._dialogRef.close();
    this.isConfirmed.emit(this.trackingNumber);
  }
}
