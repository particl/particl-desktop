import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';
import { Listing } from '../../../core/market/api/listing/listing.model';
import { PreviewListingComponent } from '../preview-listing/preview-listing.component';

@Component({
  selector: 'app-listing-item',
  templateUrl: './listing-item.component.html',
  styleUrls: ['./listing-item.component.scss']
})
export class ListingItemComponent {
  @Input() listing: Listing;
  constructor(private dialog: MatDialog,
              public listingCacheService: PostListingCacheService) {
  }

  openListing() {
    const dialog = this.dialog.open(PreviewListingComponent, {
      data: {listing: this.listing},
    });
  }

}
