import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { FavoritesService } from '../../../core/market/api/favorites/favorites.service';
import { MarketStateService } from '../../../core/market/market-state/market-state.service';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { PreviewListingComponent } from '../preview-listing/preview-listing.component';

@Component({
  selector: 'app-listing-item',
  templateUrl: './listing-item.component.html',
  styleUrls: ['./listing-item.component.scss']
})
export class ListingItemComponent implements OnInit {
  @Input() listing: Listing;
  // Input hashes
  @Input() hashes: Array<any> = new Array();
  constructor(private dialog: MatDialog,
              private favoritesService: FavoritesService,
              private snackbar: SnackbarService,
              private marketState: MarketStateService) {
  }

  ngOnInit() {
    // Passing all hashes as a key
    this.listing.hashes = this.hashes;
  }

  openListing() {
    const dialog = this.dialog.open(PreviewListingComponent, {
      data: {listing: this.listing},
    });
  }

}
