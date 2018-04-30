import {Component, Input, OnInit} from '@angular/core';
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
export class FavoriteComponent implements OnInit {

  private log: any = Log.create('favorite.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() listing: Listing;

  constructor(
    public favorites: FavoritesService,
    private snackbar: SnackbarService,
    private marketState: MarketStateService
  ) {}

  ngOnInit() { }

  toggle() {
    this.favorites.toggle(this.listing);
  }

  get isFavorited(): boolean {
    return this.favorites.cache.isFavorited(this.listing);
  }
}
