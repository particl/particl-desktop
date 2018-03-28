import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingComponent } from 'app/market/listing/listing.component';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';
import { Template } from 'app/core/market/api/template/template.model';

@Component({
  selector: 'app-preview-listing',
  templateUrl: './preview-listing.component.html',
  styleUrls: ['./preview-listing.component.scss']
})
export class PreviewListingComponent implements OnInit {

  @Input() listing: Template;

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
    if (this.listing.thumbnail) {
      // TODO: logic for main image, taking 0 here
      return this.listing.thumbnail.dataId;
    } else {
      return './assets/images/placeholder_4-3.jpg';
    }

  }

  addToCart(id) {
    this.cartService.addItem(id).subscribe();
  }

  addToFavorites(id) {
    this.favoritesService.addItem(id).take(1).subscribe(res => console.log(res));
  }
}
