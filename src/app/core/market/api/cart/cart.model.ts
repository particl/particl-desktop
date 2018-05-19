
import * as _ from 'lodash';

import { Listing } from '../listing/listing.model';
import { Amount } from 'app/core/util/utils';

export class Cart {

  public shoppingCartItems: Array<any>;

  public subTotal: Amount = new Amount(0);
  public shippingTotal: Amount = new Amount(0);
  public escrowTotal: Amount = new Amount(0);
  public total: Amount = new Amount(0);

  constructor(private object: Array<any>) {
      this.shoppingCartItems = _.cloneDeep(object)
      this.setCartItems();
  }

    setSubTotal(): void {
      let total = 0.0;
      this.listings.forEach(listing => {
        total += listing.basePrice.getAmount();
      });
      this.subTotal = new Amount(total);
    }

    setShippingTotal(): void {
      let total = 0.0;
      this.listings.forEach(listing => {
        total += listing.internationalShippingPrice.getAmount();
      });
      this.shippingTotal = new Amount(total);
    }

    setEscrowTotal(): void {
      let total = 0.0;
      this.listings.forEach(listing => {
        total += listing.escrowPrice.getAmount();
      });
      this.escrowTotal = new Amount(total);
    }

    setTotal(): void {
      this.total = new Amount(this.subTotal.getAmount()
               + this.shippingTotal.getAmount()
               + this.escrowTotal.getAmount())
    }

  private setCartItems(): void {
    this.shoppingCartItems.map(item => {
      item.ListingItem = new Listing(item.ListingItem);
    });

    this.setSubTotal();
    this.setShippingTotal();
    this.setEscrowTotal();
    this.setTotal();
  }

  get countOfItems() {
    return this.shoppingCartItems.length;
  }

  get listings(): Array<Listing> {
    return this.shoppingCartItems.map((sci: any) => sci.ListingItem);
  }

}
