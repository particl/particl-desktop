import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  placeOrder() {
    if (this.rpcState.get('locked')) {
      // unlock wallet and send transaction
      this.modals.open('unlock', {forceOpen: true, timeout: 30, callback: this.bidOrder.bind(this)});
    } else {
      // wallet already unlocked
      this.bidOrder();
    }
  }

  bidOrder() {
    this.bid.order(this.cart, this.profile).subscribe((res) => {
      this.clearCart(false);

      this.snackbarService.open('Order has been successfully placed');
      this.onOrderPlaced.emit(1);
    }, (error) => {
      this.log.d(`Error while placing an order`);
    });
  }

}
