
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

  getShippingTotal(country: string): Amount {
    let total = 0.0;
    this.listings.forEach(listing => {
      total += listing.shippingAmount(country).getAmount();
    });
    return new Amount(total);
  }

  getEscrowTotal(country: string): Amount {
    let total = 0.0;
    this.listings.forEach(listing => {
      total += listing.escrowAmount(country).getAmount();
    });
    return new Amount(total);
  }

  getTotal(country: string): Amount {
    return new Amount(this.subTotal.getAmount()
             + this.getShippingTotal(country).getAmount()
             + this.getEscrowTotal(country).getAmount())
  }

  private setCartItems(): void {
    this.shoppingCartItems.map(item => {
      item.ListingItem = new Listing(item.ListingItem);
    });

    this.setSubTotal();
  }

  get countOfItems() {
    return this.shoppingCartItems.length;
  }

  get listings(): Array<Listing> {
    return this.shoppingCartItems.map((sci: any) => sci.ListingItem);
  }

  getSubTotalWithShippingTotal(country: string): Amount {
    const total = this.subTotal.getAmount() + this.getShippingTotal(country).getAmount();
    return  new Amount(total);
  }
}
