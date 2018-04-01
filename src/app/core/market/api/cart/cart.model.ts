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
      this.shoppingCartItems.forEach(shoppingCartItem => {
        const listing: Listing = shoppingCartItem.ListingItem;
        total += listing.basePrice.getAmount();
      });
      this.subTotal = new Amount(total);
    }

    setShippingTotal(): void {
      let total = 0.0;
      this.shoppingCartItems.forEach(shoppingCartItem => {
        const listing: Listing = shoppingCartItem.ListingItem;
        total += listing.internationalShippingPrice.getAmount();
      });
      this.shippingTotal = new Amount(total);
    }

    setEscrowTotal(): void {
      let total = 0.0;
      this.shoppingCartItems.forEach(shoppingCartItem => {
        const listing: Listing = shoppingCartItem.ListingItem;
        total += listing.escrowPrice.getAmount();
      });
      this.escrowTotal = new Amount(total);
    }

    setTotal(): void {
      let total: number = 0.0;
      total += (this.subTotal.getAmount() 
              + this.shippingTotal.getAmount()
              + this.escrowTotal.getAmount());
      this.total = new Amount(total);
    }

  private setCartItems(): void {
    this.shoppingCartItems.map(shoppingCartItem => {
      shoppingCartItem.ListingItem = new Listing(shoppingCartItem.ListingItem);
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
