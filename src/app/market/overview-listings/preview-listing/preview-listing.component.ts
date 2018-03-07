import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ListingComponent } from 'app/market/listing/listing.component';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';
import { Template } from 'app/core/market/api/template/template.model';
import {SnackbarService} from "../../../core/snackbar/snackbar.service";

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
    private favoritesService: FavoritesService,
    private snackbar: SnackbarService
  ) { }

  ngOnInit() {
    // console.log(this.listing);
  }

  openListing() {
    const dialog = this.dialog.open(ListingComponent, {
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

  addToCart(id: number) {
    this.cartService.addItem(id);
  }

  addToFavorites(id: number) {
    if (this.listing.favorite) {
      this.favoritesService.removeItem(id).take(1).subscribe(res => {
        this.snackbar.open(`${this.listing.title} Removed from Favorite list`);
        this.listing.favorite = false;
      });
    }
    this.favoritesService.addItem(id).take(1).subscribe(res => {
      this.snackbar.open(`${this.listing.title} Add to Favorite list`);
      this.listing.favorite = true;
    });

  }
}
