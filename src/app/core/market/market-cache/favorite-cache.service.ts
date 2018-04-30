import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Log } from 'ng2-logger';

import { FavoritesService } from '../api/favorites/favorites.service';
import { Favorite } from '../api/favorites/favorite.model';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { Listing } from 'app/core/market/api/listing/listing.model';

@Injectable()
export class FavoriteCacheService {

  private log: any = Log.create('favorite-cache.service id:' + Math.floor((Math.random() * 1000) + 1));
  public favorites: Favorite[];

  constructor(
    private marketState: MarketStateService,
  ) {
    // subscribe to changes
    this.getFavorites().subscribe((favorite: Favorite[]) => {
      this.favorites = favorite;
    });
   }

  isFavorited(listing: Listing): boolean {
    const listingItemId = listing.id;
    const index = _.findIndex(this.favorites, function (obj: Favorite) {
      return obj.listingItemId === listingItemId;
    });
    return (index > -1)
  }

  update() {
    this.marketState.register('favorite', null, ['list', 1]);
  }

  getFavorites() {
    return this.marketState.observe('favorite');
  }

}
