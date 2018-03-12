import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from '../../market-state/market-state.service';
import { Favorite } from './favorite.model';

@Injectable()
export class FavoritesService {

  public favorites: Favorite[];
  constructor(
    private market: MarketService,
    private marketState: MarketStateService
  ) {
    this.storeFavorites();
  }

  addItem(id: number) {
    return this.market.call('favorite', ['add', 1, id]);
  }

  removeItem(id: number) {
    return this.market.call('favorite', ['remove', 1, id]);
  }

  getFavorites() {
    return this.market.call('favorite', ['list', 1])
  }

  storeFavorites() {
    this.marketState.observe('favorite').subscribe((favorite: Favorite[]) => {
      this.favorites = favorite;
    });
  }

  isListingItemFavorited(listingItemId: number): boolean {
    const index = _.findIndex(this.favorites, function (obj: Favorite) {
      return obj.listingItemId === listingItemId;
    });
    return (index > -1)
  }
}
