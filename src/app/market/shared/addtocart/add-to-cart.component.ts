import {Component, Input, OnInit, EventEmitter, Output} from '@angular/core';
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
  @Output() onAdded: EventEmitter<any> = new EventEmitter();
  private log: any = Log.create('add-to-cart.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() inCart: boolean;
  @Input() bidding: boolean;
  @Input() listing: Listing;
  @Input() detail: boolean = true; // is button on Listing's detail or on Listings overview?

  constructor(
    private cartService: CartService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() { }

  addToCart() {
    this.cartService.add(this.listing).subscribe(res => {
      this.snackbar.open('Item successfully added to cart');
      this.onAdded.emit();
    }, error => this.snackbar.open(error));
  }

  get bidded(): boolean {
    return this.cartService.cache.isBidded(this.listing);
  }

  checkState() {
    if (this.inCart) {
      return 'Item in cart'
    } else if (this.bidding) {
      return 'Bidding on item'
    } else if (this.listing.isMine) {
      return 'This is your item'
    } else if (this.bidded) {
      return 'Being processed'
    }
  }

}
