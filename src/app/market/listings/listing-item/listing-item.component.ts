import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';
import { Listing } from '../../../core/market/api/listing/listing.model';
import { PreviewListingComponent } from '../preview-listing/preview-listing.component';
import { MarketNotificationService } from 'app/core/market/market-notification/market-notification.service';

@Component({
  selector: 'app-listing-item',
  templateUrl: './listing-item.component.html',
  styleUrls: ['./listing-item.component.scss']
})
export class ListingItemComponent {
  @Input() listing: Listing;
  @Output() reportListingComplete: EventEmitter<any> = new EventEmitter();
  constructor(
    private dialog: MatDialog,
    public listingCacheService: PostListingCacheService,
    private notification: MarketNotificationService
  ) {}

  get hasNewComments() {
    return this.notification.targetHasUnread('LISTINGITEM_QUESTION_AND_ANSWERS', this.listing.hash);
  }

  openListing() {
    const dialog = this.dialog.open(PreviewListingComponent, {
      data: {
        listing: this.listing,
        reportListingComplete: this.reportListingComplete
      }
    });
  }

  reportListingFinished() {
    this.reportListingComplete.emit();
  }
}
