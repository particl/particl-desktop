import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { CartService } from 'app/core/market/api/cart/cart.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';

@Component({
  selector: 'app-preview-listing',
  templateUrl: './preview-listing.component.html',
  styleUrls: ['./preview-listing.component.scss']
})

export class PreviewListingComponent implements OnInit {

  public pictures: Array<any> = new Array();
  public price: any;
  public date: string;

  constructor(
    private dialogRef: MatDialogRef<PreviewListingComponent>,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private marketState: MarketStateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.data.listing.images.map(image => {
      this.pictures.push(image.ItemImageDatas.find(size => {
        return size.imageVersion === 'MEDIUM';
      }));
    });

    let price = this.data.listing.object.PaymentInformation.ItemPrice;
    if (price && price.basePrice) {
      price = price.basePrice;
      this.price = {
        int:     price.toFixed(0),
        cents:  (price % 1).toFixed(8),
        escrow: (price * this.data.listing.object.PaymentInformation.Escrow.Ratio.buyer / 100).toFixed(8),
        usd: +(price * this.marketState.get('currencyprice')[0].price).toFixed(2)
      };
    }


    this.date = new Date(this.data.listing.object.createdAt).toLocaleDateString();
  }

  addToCart(id: number) {
    this.cartService.addItem(id);
  }

  addToFavorites(id: number) {
    this.favoritesService.addItem(id);
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
