import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {
  public type: string = '';
  @Output() isConfirmed: EventEmitter<string> = new EventEmitter();
  constructor(public _dialogRef: MatDialogRef<PlaceOrderComponent>) { }

  ngOnInit() {
  }

  placeOrder(): void {
    this._dialogRef.close();
    this.isConfirmed.emit();
  }
}
