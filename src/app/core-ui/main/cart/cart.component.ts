
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { Cart } from 'app/core/market/api/cart/cart.model';
import { CartService } from 'app/core/market/api/cart/cart.service';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {

  private log: any = Log.create('cart.component');

  private destroyed: boolean = false;
  cart: Cart;

  constructor(
    private cartService: CartService,
  ) { }

  ngOnInit() {
    // Obtain total cart items
    this.cartService.list()
      .takeWhile(() => !this.destroyed)
      .subscribe(cart => {
        this.cart = cart;
      });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
