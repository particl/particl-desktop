import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from '../../market-state/market-state.service';

import { FavoriteCacheService } from 'app/core/market/market-cache/favorite-cache.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

import { Favorite } from './favorite.model';
import { Listing } from 'app/core/market/api/listing/listing.model';




@Injectable()
export class FavoritesService {

  private log: any = Log.create('favorite.service id:' + Math.floor((Math.random() * 1000) + 1));

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    public cache: FavoriteCacheService,
    private snackbar: SnackbarService
  ) {

  }

  add(listing: Listing) {
    return this.market.call('favorite', ['add', 1, listing.id])
    .do((data) => {
      this.cache.update();
    });
  }

  remove(listing: Listing) {
    return this.market.call('favorite', ['remove', 1, listing.id])
      .do((data) => {
        this.cache.update();
      });
  }

  toggle(listing: Listing): void {
    if (this.cache.isFavorited(listing) === true) {
      this.remove(listing).take(1).subscribe(res => {
        this.snackbar.open(`${listing.title} removed from Favorites`);
      });
    } else {
      this.add(listing).take(1).subscribe(res => {
        this.snackbar.open(`${listing.title} added to Favorites`);
      });
    }
  }

}
