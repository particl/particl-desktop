import { Injectable } from '@angular/core';

import { MarketService } from 'app/core/market/market.service';

import { SnackbarService } from 'app/core/snackbar/snackbar.service';

@Injectable()
export class CartService {

  constructor(
    private market: MarketService,
    private snackbar: SnackbarService
  ) { }

  addItem(id) {
    this.market.call('cartitem', ['add', 1, id]).take(1).subscribe(
      data => this.snackbar.open(data.message),
      err  => this.snackbar.open(err)
    );
  }

  getCart() {
    return this.market.call('cart', ['get', 1]);
  }

}
