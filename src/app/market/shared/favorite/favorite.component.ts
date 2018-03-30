import {Component, Input, OnInit} from '@angular/core';
import { Log } from 'ng2-logger';

import { FavoritesService } from '../../../core/market/api/favorites/favorites.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { MarketStateService } from '../../../core/market/market-state/market-state.service';

import { Listing } from '../../../core/market/api/listing/listing.model';


@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  private log: any = Log.create('favorite.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() listing: Listing;

  constructor(
    public favoritesService: FavoritesService,
    private snackbar: SnackbarService,
    private marketState: MarketStateService
  ) {}

  ngOnInit() { }

  toggle() {
    this.favoritesService.toggle(this.listing);
  }

  get isFavorited(): boolean {
    return this.favoritesService.isListingItemFavorited(this.listing.id);
  }
}
