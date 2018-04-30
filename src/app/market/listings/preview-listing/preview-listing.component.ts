import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { CartService } from 'app/core/market/api/cart/cart.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';
import { Listing } from 'app/core/market/api/listing/listing.model';

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

  private currencyprice: number = 0;

  constructor(
    private dialogRef: MatDialogRef<PreviewListingComponent>,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private marketState: MarketStateService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    this.marketState.observe('currencyprice')
      .takeWhile(() => !this.destroyed)
      .subscribe(price => {
        this.currencyprice = price[0].price;
      });
  }

  addToCart(listing: Listing) {
    this.cartService.add(listing).subscribe();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
