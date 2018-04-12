import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {
  public type: string = '';
  constructor(public _dialogRef: MatDialogRef<PlaceOrderComponent>) { }

  ngOnInit() {
  }

  placeOrder() {
    this._dialogRef.close();
  }
}
