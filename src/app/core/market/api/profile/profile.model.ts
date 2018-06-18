import { Cart } from '../cart/cart.model';
import { Favorite } from '../favorites/favorite.model';

export class Profile {

  public shippingAddresses: Array<any>;
  public shoppingCarts: Array<Cart>;
  public favorites: Array<Favorite>;

  constructor(private object: any) {
    this.setShippingAddresses();
    this.setShoppingCarts();
    this.setFavoriteItems();
  }

  get id(): number {
    return this.object.id;
  }

  get address(): string {
    return this.object.address;
  }

  get name(): string {
    return this.object.name;
  }

  setShippingAddresses() {
    this.shippingAddresses = this.object.ShippingAddresses
                            .filter((address) => address.title && address.type === 'SHIPPING_OWN')
  }

  setShoppingCarts() {
    this.shoppingCarts = this.object.ShoppingCart.filter((shop) => shop.name === 'DEFAULT')
  }

  setFavoriteItems() {
    this.favorites = this.object.FavoriteItems.filter((fav) => fav.name === 'DEFAULT')
  }
}
