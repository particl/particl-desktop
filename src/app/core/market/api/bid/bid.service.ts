import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

import { Cart } from 'app/core/market/api/cart/cart.model';

@Injectable()
export class BidService {

  constructor(private market: MarketService,
              private marketState: MarketStateService,
              private snackbar: SnackbarService) {
  }

  order(cart: Cart, profile: any): Promise<boolean> {
    let nBidsPlaced = 0;
    const listings = cart.cartDbObj;

    return new Promise((resolve, reject) => {
      listings.forEach((listing: any) => {
        if (listing.ListingItem && listing.ListingItem.hash) {
          // bid for item
          this.market.call('bid', ['send', listing.ListingItem.hash, profile.address])
            .subscribe(
              (res) => {
                if (++nBidsPlaced === listings.length) {
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
}
