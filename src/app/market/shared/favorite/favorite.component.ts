import {Component, Input, OnInit} from '@angular/core';

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

  @Input() listing: Listing;

  constructor(
    public favoritesService: FavoritesService,
    private snackbar: SnackbarService,
    private marketState: MarketStateService
  ) {}

  ngOnInit() {
  }

  addToFavorites() {
    if (this.listing.favorite) {
      this.favoritesService.removeItem(this.listing.id).take(1).subscribe(res => {
        this.updateFavorites();
        this.snackbar.open(`${this.listing.title} removed from Favorite`);
        this.listing.favorite = false;
      });
    } else {
      this.favoritesService.addItem(this.listing.id).take(1).subscribe(res => {
        this.updateFavorites();
        this.snackbar.open(`${this.listing.title} added to Favorite`);
        this.listing.favorite = true;
      });
    }
  }

  updateFavorites() {
    this.marketState.registerStateCall('favorite', null, ['list', 1]);
  }
}
