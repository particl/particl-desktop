import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

import { Cart } from 'app/core/market/api/cart/cart.model';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Bid } from 'app/core/market/api/bid/bid.model';


@Injectable()
export class BidService {

  private log: any = Log.create('cart.service id:' + Math.floor((Math.random() * 1000) + 1));
  
  constructor(private market: MarketService,
              private marketState: MarketStateService,
              private snackbar: SnackbarService) {
  }

  order(cart: Cart, profile: any): Promise<boolean> {
    let nBidsPlaced = 0;
    const addressIdOfProfile: number = profile.ShippingAddresses[0].id;

    return new Promise((resolve, reject) => {
      cart.listings.forEach((listing: Listing) => {
        if (listing.hash) {
          // bid for item
          this.market.call('bid', ['send', listing.hash, addressIdOfProfile])
            .subscribe(
              (res) => {
                this.log.d(`Bid placed for hash=${listing.hash} shipping to addressId=${addressIdOfProfile}`);
                if (++nBidsPlaced === cart.listings.length) {
                  this.snackbar.open('Order has been successfully placed');
                  resolve(true);
                }
              },
              (failed) => {
                reject(false);
              });
        }
      });
    });
  }

  search(): Observable<Array<Bid>> {
    // Params: flag for buy or sell required
    const params = ['search'];
    return this.market.call('bid', params)
  }
}
