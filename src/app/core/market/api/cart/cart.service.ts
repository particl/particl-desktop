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

  addItem(listingItemId: number) {
    this.log.d(`Adding listingItemId=${listingItemId} to cart with id=1`);
    this.market.call('cartitem', ['add', 1, listingItemId]).take(1).subscribe(
      data => {
        this.snackbar.open(data)
        this.marketState.registerStateCall('cart', null, ['get', 1])
      },
      err  => this.snackbar.open(err)
    );
  }

  getCart() {
    this.log.d(`Getting cart with id=1`);
    return this.market.call('cart', ['get', 1]).map(c => new Cart(c));
  }

  removeItem(listingItemId: number) {
    this.log.d(`Removing listingItemId=${listingItemId} from cart with id=1`);
    return this.market.call('cartitem', ['remove', 1, listingItemId]);
  }

  clearCart(): Observable<any> {
    this.log.d(`Clearing cart with id=1`);
    return this.market.call('cart', ['clear', 1]);
  }

}
