import {Component, Input, OnInit, EventEmitter, Output, state} from '@angular/core';
import { Log } from 'ng2-logger';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { CartService } from '../../../core/market/api/cart/cart.service'
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import * as _ from 'lodash';
import { StateDataI } from '../listing-state.model';

@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss']
})
export class AddToCartComponent implements OnInit {
  @Output() onAdded: EventEmitter<any> = new EventEmitter();
  private log: any = Log.create('add-to-cart.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() stateData: StateDataI;
  @Input() listing: Listing;
  @Input() detail: boolean = true; // is button on Listing's detail or on Listings overview?
  showMessages: boolean;
  buttonMessage: string;

  constructor(
    private cartService: CartService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() {
    this.displayMessages();
  }

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
    if (this.stateData.inCart) {
      return 'Item in cart'
    } else if (this.stateData.bidding) {
      return 'Bidding on item'
    } else if (this.listing.isMine) {
      return 'This is your item'
    } else if (this.stateData.completed) {
      return 'Successfully purchased'
    } else if (this.bidded) {
      return 'Being processed'
    } else if (this.stateData.rejected) {
      return 'REJECTED'
    }
  }

  displayMessages() {
    this.stateData.isMine = (this.listing.isMine ? true : false);
    this.stateData.bidded = this.bidded;
    this.showMessages = _.find(_.values(this.stateData), (o) => o === true) || false;
    this.buttonMessage = this.checkState();
  }
}
