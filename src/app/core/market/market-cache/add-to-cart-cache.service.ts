import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Injectable()
export class AddToCartCacheService implements OnDestroy {

  private log: any = Log.create('add-to-cart-cache.service id:' + Math.floor((Math.random() * 1000) + 1));
  public orders: Array<any> = new Array();
  private destroyed: boolean = false;
  private profile$: Subscription;

  constructor(
    private marketState: MarketStateService
  ) {}

  start() {
    this.update();
    // subscribe to changes
    this.profile$ = this.getBids().pipe(takeWhile(() => !this.destroyed)).subscribe(orders => {
      this.orders = orders;
    });
  }

  stop() {
    this.profile$.unsubscribe();
  }

  isBidded(listing: Listing): boolean {
    if (listing) {
      return this.orders.filter(order => order.ListingItem.hash)
                        .map(o => o.ListingItem.hash)
                        .includes(listing.hash);
    }
    return false;
  }

  update() {
    this.marketState.register('bid', null, ['search', 0, 9999, 'ASC'])
  }

  getBids() {
    return this.marketState.observe('bid');
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
