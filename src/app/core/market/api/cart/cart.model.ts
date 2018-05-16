import { Listing } from '../listing/listing.model';
import { Amount } from 'app/core/util/utils';
export class Cart {

  public shoppingCartItems: Array<any>;

  public subTotal: Amount = new Amount(0);
  public shippingTotal: Amount = new Amount(0);
  public escrowTotal: Amount = new Amount(0);
  public total: Amount = new Amount(0);

  constructor(public cartDbObj: any) {
      this.shoppingCartItems = this.cartDbObj;
      this.setCartItems();
  }

    setSubTotal(): void {
      let total = 0.0;
      this.listings.forEach(listing => {
        total += listing.basePrice.getAmount();
      });
      this.subTotal = new Amount(total);
    }

    setShippingTotal(country: string): Amount {
      let total = 0.0;
      this.listings.forEach(listing => {
        total += country === listing.country ? (
            listing.domesticShippingPrice.getAmount()
          ) : (
            listing.internationalShippingPrice.getAmount()
          )
      });
      return new Amount(total);
    }

    setEscrowTotal(country: string): Amount {
      let total = 0.0;
      this.listings.forEach(listing => {
        total += country === listing.country ? (
            listing.escrowPriceDomestic.getAmount()
          ) : (
            listing.escrowPriceInternational.getAmount()
          )
      });
      return new Amount(total);
    }

    setTotal(country: string): Amount {
      return new Amount(this.subTotal.getAmount()
               + this.setShippingTotal(country).getAmount()
               + this.setEscrowTotal(country).getAmount())
    }

  private setCartItems(): void {
    this.shoppingCartItems.map(shoppingCartItem => {
      shoppingCartItem.ListingItem = new Listing(shoppingCartItem.ListingItem);
    });

    this.setSubTotal();
  }

  get countOfItems() {
    return this.shoppingCartItems.length;
  }

  get listings(): Array<Listing> {
    return this.shoppingCartItems.map((sci: any) => sci.ListingItem);
  }

}
