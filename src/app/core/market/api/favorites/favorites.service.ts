import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from '../../market-state/market-state.service';
import { Favorite } from './favorite.model';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';


@Injectable()
export class FavoritesService {

  private log: any = Log.create('favorite.service id:' + Math.floor((Math.random() * 1000) + 1));

  public favorites: Favorite[];
  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    private snackbar: SnackbarService
  ) {
    this.storeFavorites();
  }

  addItem(id: number) {
    return this.market.call('favorite', ['add', 1, id])
    .do((data) => {
      this.updateListOfFavorites();
    });
  }

  removeItem(id: number) {
    return this.market.call('favorite', ['remove', 1, id])
      .do((data) => {
        this.updateListOfFavorites();
      });
  }

  toggle(listing: Listing): void {
    if (this.isListingItemFavorited(listing.id) === true) {
      this.removeItem(listing.id).take(1).subscribe(res => {
        this.snackbar.open(`${listing.title} removed from Favorites`);
      });
    } else {
      this.addItem(listing.id).take(1).subscribe(res => {
        this.snackbar.open(`${listing.title} added to Favorites`);
      });
    }
  }

  getFavorites() {
    return this.marketState.observe('favorite');
  }

  storeFavorites() {
    this.getFavorites().subscribe((favorite: Favorite[]) => {
      this.favorites = favorite;
      this.favorites.forEach((e) => {
        this.log.d('listing with id ' + e.listingItemId + ' is favorited');
      });
    });
  }

  updateListOfFavorites() {
    this.marketState.registerStateCall('favorite', null, ['list', 1]);
  }

  isListingItemFavorited(listingItemId: number): boolean {
    const index = _.findIndex(this.favorites, function (obj: Favorite) {
      return obj.listingItemId === listingItemId;
    });
    return (index > -1)
  }
}
