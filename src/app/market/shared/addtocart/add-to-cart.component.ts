import {Component, Input, OnInit} from '@angular/core';
import { Log } from 'ng2-logger';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { CartService } from '../../../core/market/api/cart/cart.service'

@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss']
})
export class AddToCartComponent implements OnInit {

  private log: any = Log.create('add-to-cart.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() listing: Listing;

  constructor(
    private cartService: CartService
  ) {}

  ngOnInit() { }

  addToCart() {
    this.cartService.add(this.listing).subscribe();
  }

  get bidded(): boolean {
    return this.cartService.cache.isBidded(this.listing);
  }

}
