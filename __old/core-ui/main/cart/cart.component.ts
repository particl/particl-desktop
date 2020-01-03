
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { Cart } from 'app/core/market/api/cart/cart.model';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';
import { takeWhile } from 'rxjs/operators';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {

  private log: any = Log.create('cart.component id: ' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  cart: Cart;

  constructor(
    private cartService: CartService,
    public listCache: PostListingCacheService
  ) { }

  ngOnInit() {
    // Obtain total cart items
    this.cartService.list()
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(cart => this.cart = cart);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
