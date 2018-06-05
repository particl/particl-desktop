import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { CartService } from 'app/core/market/api/cart/cart.service';

import { Cart } from 'app/core/market/api/cart/cart.model';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Bid } from 'app/core/market/api/bid/bid.model';

export enum errorType {
  unspent = 'Zero unspent outputs - insufficient funds to place the order.',
  broke = 'Insufficient funds to place the order.'
}

@Injectable()
export class BidService {

  private log: any = Log.create('bid.service id:' + Math.floor((Math.random() * 1000) + 1));

  constructor(private market: MarketService, private cartService: CartService) {
  }

  public async order(cart: Cart, profile: any, addressId: number): Promise<string> {

    for (let i = 0; i < cart.listings.length; i++) {
      const listing: Listing = cart.listings[i];
      if (listing.hash) {
        this.log.d(`Placing bid for hash=${listing.hash}`);
        // bid for item
        await this.market.call('bid', ['send', listing.hash, profile.id, addressId]).toPromise()
          .catch((error) => {
            if (error) {
              error = this.errorHandle(error);
            }
            throw error;
          });
        this.log.d(`Bid placed for hash=${listing.hash} shipping to addressId=${addressId}`);
        this.cartService.removeItem(listing.id).take(1).subscribe();
      }
    }
    return 'Placed all orders!';
  }

  search(address: string, type: any): Observable<any> {
    const params = ['search', '*', '*', 'ASC'];
    return this.market.call('bid', params).map(o => new Bid(o, address, type))
  }

  acceptBidCommand(hash: string, id: number): Observable<any> {
    const params = ['accept', hash, id];
    return new Observable((observer) => {
      this.market.call('bid', params).subscribe(res => console.log(res), (error) => {
        if (error) {
          error = this.errorHandle(error);
        }
        observer.error(error);
      });
    });
  }

  rejectBidCommand(hash: string, id: number): Observable<any> {
    const params = ['reject', hash, id];
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
    error = error.error ? error.error.error : error;
    if (error.includes('unspent')) {
      error = errorType.unspent;
    } else if (error.includes('broke')) {
      error = errorType.broke;
    }
    return error;
  }

}
