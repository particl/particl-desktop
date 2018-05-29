import {Component, Input, OnInit} from '@angular/core';
import { Log } from 'ng2-logger';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { CartService } from '../../../core/market/api/cart/cart.service'
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss']
})
export class AddToCartComponent implements OnInit {

  private log: any = Log.create('add-to-cart.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() listing: Listing;

  constructor(
    private cartService: CartService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() { }

  addToCart() {
    this.cartService.add(this.listing).subscribe(res => {
      this.snackbar.open('Item successfully added in cart');
    }, error => this.snackbar.open(error));
  }

  get bidded(): boolean {
    return this.cartService.cache.isBidded(this.listing);
  }

}
