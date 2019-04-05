import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { AddToCartCacheService } from 'app/core/market/market-cache/add-to-cart-cache.service';
import { Cart } from './cart.model';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Subscription } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';


@Injectable()
export class CartService {

  private log: any = Log.create('cart.service id:' + Math.floor((Math.random() * 1000) + 1));

  private defaultCartId: number;
  private profile$: Subscription;

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    private profile: ProfileService,
    public cache: AddToCartCacheService
  ) {}

  start() {
    this.profile$ = this.default().subscribe((cart: any) => {
      this.log.d('Setting default cartId and registering listener= ' + cart.id);
      this.defaultCartId = cart.id;
      this.marketState.register('cartitem', 60 * 1000, ['list', cart.id, true]);
    });
  }

  stop() {
    this.profile$.unsubscribe();
  }

  add(listing: Listing): Observable<any> {
    this.log.d(`Adding listingItemId=${listing.id} to cart with id=${this.defaultCartId}`);
    return this.market.call('cartitem', ['add', this.defaultCartId, listing.id]).pipe(take(1)).pipe(tap(
      data => {
        this.update();
      }
    ));
  }

  /**
   * Returns the default cart (list format),
   * without items.
   *  {
   *    "id": 1,
   *    "name": "DEFAULT",
   *    "profileId": 1,
   *    "updatedAt": 1525487783852,
   *    "createdAt": 1525487783852
   *  }
   */
  default(): Observable<any> {
      // get default profile
      this.log.d('default(): getting default cart!');
      return this.profile.default()
      .pipe(map((profile: any) => profile.shoppingCarts))
      .pipe(map(carts => carts.find((cart: any) => cart.name === 'DEFAULT')))


  }

  list(): Observable<Cart> {
    this.log.d(`Getting cart with id=${this.defaultCartId}`);
    return this.marketState.observe('cartitem')
    .pipe(map(c => new Cart(c)));
  }

  removeItem(listingItemId: number): Observable<any> {
    this.log.d(`Removing listingItemId=${listingItemId} from cart with id=${this.defaultCartId}`);
    return this.market.call('cartitem', ['remove', this.defaultCartId, listingItemId]).pipe(tap(
      data => {
        this.update();
      }
    ));
  }

  clear(): Observable<any> {
    this.log.d(`Clearing cart with id=${this.defaultCartId}`);
    return this.market.call('cart', ['clear', this.defaultCartId]).pipe(tap(this.update.bind(this)))
  }

  update(): void {
    this.marketState.register('cartitem', null, ['list', this.defaultCartId, true]);
  }

}
