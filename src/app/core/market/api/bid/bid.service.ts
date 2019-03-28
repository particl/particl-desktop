import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger';
import { MarketService } from 'app/core/market/market.service';
import { CartService } from 'app/core/market/api/cart/cart.service';

import { Cart } from 'app/core/market/api/cart/cart.model';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { BidCollection } from 'app/core/market/api/bid/bidCollection.model';
import { take, map, catchError } from 'rxjs/operators';

export enum errorType {
  unspent = 'Zero unspent outputs - insufficient funds to place the order.',
  broke = 'Insufficient funds to place the order.',
  itemExpired = 'An item in your basket has expired!',
  enough = 'Not enough spendable funds'
}

@Injectable()
export class BidService {

  private log: any = Log.create('bid.service id:' + Math.floor((Math.random() * 1000) + 1));

  constructor(private market: MarketService, private cartService: CartService) {
  }

  public async order(cart: Cart, profile: any, shippingAddress: any): Promise<string> {
    let isValid = true;
    const timeBuffer = 5000;
    const validDate = new Date().getTime() + timeBuffer;
    for (let i = 0; i < cart.listings.length; i++) {
      const listing: Listing = cart.listings[i];
      if (!( (validDate + (i * 2000) ) < listing.object.expiredAt)) {
        isValid = false;
        break;
      }
    }
    if (!isValid) {
      throw errorType.itemExpired;
    }

    const shippingParams = [];
    for (const key of Object.keys(shippingAddress)) {
      shippingParams.push(key);
      shippingParams.push(shippingAddress[key]);
    }

    for (let i = 0; i < cart.listings.length; i++) {
      const listing: Listing = cart.listings[i];
      if (listing.hash) {
        this.log.d(`Placing bid for hash=${listing.hash}`);
        // bid for item
        await this.market.call('bid', ['send', listing.hash, profile.id, false, ...shippingParams]).toPromise()
          .catch((error) => {
            if (error) {
              error = this.errorHandle(error.toString());
            }
            throw error;
          });
        this.log.d(`Bid placed for hash=${listing.hash} shipping to addressId=${shippingAddress}`);
        this.cartService.removeItem(listing.id).pipe(take(1)).subscribe();
      }
    }
    return 'Placed all orders!';
  }

  search(address: string, type?: any, status?: string, search?: string, additionalFilter?: any): Observable<BidCollection> {
    const params = ['search', 0, 99999, 'ASC', '*', status, search ];
    return this.market.call('bid', params)
    .pipe(map(o => new BidCollection(o, address, type, additionalFilter)))
  }

  acceptBidCommand(id: number): Observable<any> {
    const params = ['accept', id];
    return this.market.call('bid', params).pipe(catchError((error) => {
      if (error) {
        error = this.errorHandle(error.toString());
      }
      throw error;
    }));
  }

  rejectBidCommand(id: number): Observable<any> {
    const params = ['reject', id];
    return this.market.call('bid', params);
  }

  escrowReleaseCommand(id: number, memo: string): Observable<any> {
    const params = ['release', id, memo];
    return this.market.call('escrow', params);
  }

  escrowLockCommand(id: number, nonce: any, memo: string): Observable<any> {
    const params = ['lock', id, nonce, memo];
    return this.market.call('escrow', params);
  }

  errorHandle(error: any) {
    if (error.includes('unspent')) {
      error = errorType.unspent;
    } else if (error.includes('broke')) {
      error = errorType.broke;
    } else if (error.includes('enough')) {
      error = errorType.enough;
    }
    return error;
  }

}
