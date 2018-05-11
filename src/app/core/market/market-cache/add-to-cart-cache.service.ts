import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Log } from 'ng2-logger';

import { Bid } from '../api/bid/bid.model';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { Listing } from 'app/core/market/api/listing/listing.model';

@Injectable()
export class AddToCartCacheService {

  private log: any = Log.create('add-to-cart-cache.service id:' + Math.floor((Math.random() * 1000) + 1));
  public orders: Array<any> = new Array();;
  public hashes: Array<string>
  constructor(
    private marketState: MarketStateService
  ) {
    this.update();
    // subscribe to changes
    this.getBids().subscribe(orders => {
      this.orders = orders;
    });
   }

  isBidded(listing: Listing): boolean {
    this.hashes = this.orders.filter(order => order.OrderItem.itemHash).map(o => o.OrderItem.itemHash);
    return this.hashes.includes(listing.hash);
  }

  update() {
    this.marketState.register('bid', null, ['search', '*', '*', 'ASC'])
  }

  getBids() {
    return this.marketState.observe('bid');
  }

}
