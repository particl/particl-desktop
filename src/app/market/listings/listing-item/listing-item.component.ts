import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { FavoritesService } from '../../../core/market/api/favorites/favorites.service';
import { MarketStateService } from '../../../core/market/market-state/market-state.service';
import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { PreviewListingComponent } from '../preview-listing/preview-listing.component';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { AddToCartCacheService } from 'app/core/market/market-cache/add-to-cart-cache.service';
import { OrderStatusNotifierService } from 'app/core/market/order-status-notifier/order-status-notifier.service';

@Component({
  selector: 'app-listing-item',
  templateUrl: './listing-item.component.html',
  styleUrls: ['./listing-item.component.scss']
})
export class ListingItemComponent implements OnInit, OnDestroy {
  @Input() listing: Listing;
  inCart: boolean = false;
  bidding: boolean = false;
  destroyed: boolean = false;
  constructor(private dialog: MatDialog,
              private favoritesService: FavoritesService,
              private snackbar: SnackbarService,
              private listingCacheService: PostListingCacheService,
              private marketState: MarketStateService,
              private cartService: CartService) {
  }

  ngOnInit() {
    this.getBids();
    this.getCart();
  }

  openListing() {
    const dialog = this.dialog.open(PreviewListingComponent, {
      data: {
        listing: this.listing,
        inCart: this.inCart,
        bidding: this.bidding
      },
    });
  }
  // TODO: REMOVE once we accept multiple bids from same bidder
  getCart() {
    this.cartService.list()
    .takeWhile(() => !this.destroyed)
    .subscribe(cart => {
      for (let k = 0; k < cart.listings.length; k++) {
        if ((cart && this.listing) && (cart.listings[k].id === this.listing.id)) {
          this.inCart = true;
        }
      }
    });
  }
  // TODO: REMOVE once we accept multiple bids from same bidder
  getBids() {
    this.marketState.observe('bid')
    .takeWhile(() => !this.destroyed)
    .subscribe(bids => {
      for (let k = 0; k < bids.length; k++) {
        if ((bids && this.listing) && (bids[k].action === 'MPA_BID') && (bids[k].listingItemId === this.listing.id)) {
          console.log('YESSSSS')
          this.bidding = true;
        }
      }
    })
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
