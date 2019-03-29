import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { isPrerelease, isMainnetRelease } from 'app/core/util/utils';
@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {
  public type: string = '';
  isPrerelease: boolean = false;
  trackingNumber: string = '';
  @Output() isConfirmed: EventEmitter<string> = new EventEmitter();
  constructor(public _dialogRef: MatDialogRef<PlaceOrderComponent>) { }

  ngOnInit() {
    this.isPrerelease = isMainnetRelease() && isPrerelease();
  }

  placeOrder(): void {
    this._dialogRef.close();
    this.isConfirmed.emit();
  }
}
