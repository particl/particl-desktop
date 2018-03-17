
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { Cart } from 'app/core/market/api/cart/cart.model';


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
    private _marketState: MarketStateService,
  ) { }

  ngOnInit() {
    // Obtain total cart items
    this._marketState.observe('cartitem')
      .takeWhile(() => !this.destroyed)
      .map(c => new Cart(c))
      .subscribe(cart => {
        this.cart = cart;
      });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
