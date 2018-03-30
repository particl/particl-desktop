import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { FavoritesService } from '../../../core/market/api/favorites/favorites.service';
import { CartService } from '../../../core/market/api/cart/cart.service';
import { MarketStateService } from '../../../core/market/market-state/market-state.service';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { PreviewListingComponent } from '../preview-listing/preview-listing.component';

interface ISorting {
  value: string;
  viewValue: string;
}

interface IPage {
  pageNumber: number,
  listings: Array<any>;
}

@Component({
  selector: 'app-listing-item',
  templateUrl: './listing-item.component.html',
  styleUrls: ['./listing-item.component.scss']
})
export class ListingItemComponent {
  @Input() listing: Listing;

  constructor(private dialog: MatDialog,
              private cartService: CartService,
              private favoritesService: FavoritesService,
              private snackbar: SnackbarService,
              private marketState: MarketStateService) {
  }

  openListing() {
    const dialog = this.dialog.open(PreviewListingComponent, {
      data: {listing: this.listing},
    });
  }

  getThumbnail() {
    if (this.listing.thumbnail) {
      // TODO: logic for main image, taking 0 here
      return 'data:image/gif;base64,' + this.listing.thumbnail.data;
    } else {
      return './assets/images/placeholder_4-3.jpg';
    }
  }

  addToCart() {
    this.cartService.addItem(this.listing.id);
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
