import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingComponent } from 'app/market/listing/listing.component';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';

@Component({
  selector: 'app-preview-listing',
  templateUrl: './preview-listing.component.html',
  styleUrls: ['./preview-listing.component.scss']
})
export class PreviewListingComponent implements OnInit {

  @Input() listing: any;

  constructor(
    private dialog: MatDialog,
    private cartService: CartService,
    private favoritesService: FavoritesService
  ) { }

  ngOnInit() {
    console.log(this.listing);
  }

  openListing() {
    const dialog = this.dialog.open(ListingComponent, {
      data: { listing: this.listing },
    });
  }

  getThumbnail() {
    // TODO: logic for main image, taking 0 here
    return this.listing.ItemInformation.ItemImages[0].ItemImageDatas.find(data => {
      return data.imageVersion === 'THUMBNAIL';
    }).data;
  }

  addToCart(id) {
    this.cartService.addItem(id);
  }

  addToFavorites(id) {
    this.favoritesService.addItem(id);
  }
}
