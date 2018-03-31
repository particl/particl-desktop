import { Listing } from '../listing/listing.model';
import { Amount } from 'app/core/util/utils';
export class Cart {

  public shoppingCartItems: Array<any>;

  constructor(private cartDbObj: any) {
      this.shoppingCartItems = this.cartDbObj;
      this.setCartItems();
  }

  get subTotal(): Amount {
    let total = 0.0;
    this.shoppingCartItems.map(shoppingCartItem => {
      const object: any = shoppingCartItem.ListingItem;
      // if listing is loaded (async)
      if (object.PaymentInformation && object.PaymentInformation.ItemPrice) {
        total += object.PaymentInformation.ItemPrice.basePrice;
      }
    });
    return new Amount(total);
  }

  private setCartItems(): void {
    this.shoppingCartItems.map(shoppingCartItem => {
      const object = shoppingCartItem.ListingItem;
      if (object.ItemInformation) {
        shoppingCartItem.title = object.ItemInformation.title;
        shoppingCartItem.name = object.ItemInformation.ItemCategory.name;
        shoppingCartItem.thumbnail = this.getThumbnail(object.ItemInformation.ItemImages[0]);
      }
      if (object.PaymentInformation) {
        const basePrice = new Amount(object.PaymentInformation && object.PaymentInformation.ItemPrice
            ? object.PaymentInformation.ItemPrice.basePrice : 0);
        shoppingCartItem.integerPart = basePrice.getIntegerPart();
        shoppingCartItem.fractionPart = basePrice.getFractionalPart();
      }
    });
  }

  get countOfItems() {
    return this.shoppingCartItems.length;
  }

  private getThumbnail(images: any) {
     if (images) {
        return images.ItemImageDatas.find(data => {
          return data.imageVersion === 'THUMBNAIL';
        });
      }
      return undefined;
  }

}
