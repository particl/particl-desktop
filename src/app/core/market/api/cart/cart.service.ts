import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { Cart } from './cart.model';

import { SnackbarService } from 'app/core/snackbar/snackbar.service';


@Injectable()
export class CartService {

  private log: any = Log.create('cart.service id:' + Math.floor((Math.random() * 1000) + 1));

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    private snackbar: SnackbarService
  ) { }

  addItem(listingItemId: number): Observable<any> {
    this.log.d(`Adding listingItemId=${listingItemId} to cart with id=1`);
    return this.market.call('cartitem', ['add', 1, listingItemId]).take(1).do(
      data => {
        this.snackbar.open('Item successfully added in cart')
        this.updateCart();
      },
      err  => this.snackbar.open(err));
  }

  getCart(): Observable<any> {
    this.log.d(`Getting cart with id=1`);
    // return this.market.call('cart', ['get', 1]).map(c => new Cart(c)).do(
    //   data => console.log(data),
    //   error => console.log(error)
    //   );
    return this.market.call('cartitem', ['list', 1, true]).map(c => new Cart(c)).do(
      data => console.log(data),
      error => console.log(error)
      );
  }

  removeItem(listingItemId: number): Observable<any> {
    this.log.d(`Removing listingItemId=${listingItemId} from cart with id=1`);
    return this.market.call('cartitem', ['remove', 1, listingItemId]).do(
      data => {
        this.snackbar.open('Item successfully removed from cart');
        this.updateCart();
      },
      err => this.snackbar.open(err)
      );
  }

  clearCart(): Observable<any> {
    this.log.d(`Clearing cart with id=1`);
    return this.market.call('cart', ['clear', 1]).do(this.updateCart.bind(this), this.snackbar.open)
  }

  updateCart(): void {
    this.marketState.register('cartitem', null, ['list', 1, true])
  }

}
