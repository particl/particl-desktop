import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { CartService } from 'app/core/market/api/cart/cart.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';
import { ListingService } from 'app/core/market/api/listing/listing.service';

@Component({
  selector: 'app-preview-listing',
  templateUrl: './preview-listing.component.html',
  styleUrls: ['./preview-listing.component.scss']
})

export class PreviewListingComponent implements OnInit, OnDestroy {

  private destroyed: boolean = false;

  public pictures: Array<any> = new Array();
  public price: any;
  public date: string;
  private showAddToCart: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<PreviewListingComponent>,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.data.listing.images.map(image => {
      this.pictures.push(image.ItemImageDatas.find(size => {
        return size.imageVersion === 'MEDIUM';
      }));
    });


    
    let itemPrice = this.data.listing.object.PaymentInformation.ItemPrice;
    if (itemPrice && itemPrice.basePrice) {
      itemPrice = itemPrice.basePrice;
      this.price = {
        int:     itemPrice.toFixed(0),
        cents:  (itemPrice % 1).toFixed(8),
        escrow: (itemPrice * this.data.listing.object.PaymentInformation.Escrow.Ratio.buyer / 100).toFixed(8),
        usd: (itemPrice * ListingService.currencyPrice).toFixed(2)
      };
    }

    if(!this.data.listing.object.ListingItemTemplate.hash)
      this.showAddToCart = true;

    this.date = new Date(this.data.listing.object.createdAt).toLocaleDateString();
  }

  addToCart(id: number) {
    this.cartService.addItem(id)
      .subscribe(item => {
        console.log('added ' + id + ' to cart!');
      }
      );
  }

  addToFavorites(id: number) {
    this.favoritesService.addItem(id).subscribe();

  }

  dialogClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
