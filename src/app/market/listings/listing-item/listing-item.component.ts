import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { FavoritesService } from '../../../core/market/api/favorites/favorites.service';
import { CartService } from '../../../core/market/api/cart/cart.service';
import { MarketStateService } from '../../../core/market/market-state/market-state.service';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { PreviewListingComponent } from '../preview-listing/preview-listing.component';

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

  addToCart() {
    this.cartService.add(this.listing).subscribe();
  }
}
