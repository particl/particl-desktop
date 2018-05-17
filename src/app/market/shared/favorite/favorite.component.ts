import { Component, Input } from '@angular/core';
import { Log } from 'ng2-logger';

import { FavoritesService } from '../../../core/market/api/favorites/favorites.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { MarketStateService } from '../../../core/market/market-state/market-state.service';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { FavoriteCacheService } from 'app/core/market/market-cache/favorite-cache.service';


@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent {

  private log: any = Log.create('favorite.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() listing: Listing;
  @Input() detail: boolean = true;
  constructor(
    public favorites: FavoritesService,
    private snackbar: SnackbarService,
    private marketState: MarketStateService
  ) {}

  toggle() {
    this.favorites.toggle(this.listing);
  }

  get isFavorited(): boolean {
    return this.listing && this.favorites.cache.isFavorited(this.listing);
  }
}
