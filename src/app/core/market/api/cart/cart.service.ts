import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { AddToCartCacheService } from 'app/core/market/market-cache/add-to-cart-cache.service';
import { Cart } from './cart.model';

import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { Listing } from 'app/core/market/api/listing/listing.model';


@Injectable()
export class CartService {

  private log: any = Log.create('cart.service id:' + Math.floor((Math.random() * 1000) + 1));

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    private snackbar: SnackbarService,
    public cache: AddToCartCacheService
  ) { }

  add(listing: Listing): Observable<any> {
    this.log.d(`Adding listingItemId=${listing.id} to cart with id=1`);
    return this.market.call('cartitem', ['add', 1, listing.id]).take(1).do(
      data => {
        this.snackbar.open('Item successfully added in cart')
        this.update();
      },
      err  => this.snackbar.open(err));
  }

  list(): Observable<any> {
    this.log.d(`Getting cart with id=1`);
    return this.marketState.observe('cartitem').map(c => new Cart(c));
  }

  removeItem(listingItemId: number): Observable<any> {
    this.log.d(`Removing listingItemId=${listingItemId} from cart with id=1`);
    return this.market.call('cartitem', ['remove', 1, listingItemId]).do(
      data => {
        this.snackbar.open('Item successfully removed from cart');
        this.update();
      },
      err => this.snackbar.open(err)
      );
  }

  clear(): Observable<any> {
    this.log.d(`Clearing cart with id=1`);
    return this.market.call('cart', ['clear', 1]).do(this.update.bind(this))
  }

  update(): void {
    this.marketState.register('cartitem', null, ['list', 1, true])
  }

}
