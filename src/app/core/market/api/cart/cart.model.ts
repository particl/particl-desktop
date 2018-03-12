import { Amount } from 'app/core/util/utils';

export class Cart {

  public shoppingCartItems: Array<any>;

  constructor(private cartDbObj: any) {
    this.shoppingCartItems = this.cartDbObj.ShoppingCartItems;
  }

  get subTotal(): Amount {
    let total: number = 0.0;
    this.shoppingCartItems.map(shoppingCartItem => {
      // if listing is loaded (async)
      if (shoppingCartItem.listing) {
        total += shoppingCartItem.listing.basePrice.amount
      }
    });
    return new Amount(total);
  }

  get countOfItems() {
    return this.shoppingCartItems.length;
  }

}
