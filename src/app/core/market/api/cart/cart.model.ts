import { Listing } from '../listing/listing.model';
import { Amount } from "app/core/util/utils";
export class Cart {
    
  public shoppingCartItems: Array<any>;

  constructor(private cartDbObj: any) {
      this.shoppingCartItems = this.cartDbObj;
      this.setCartItems();
  }

  get subTotal(): Amount{
    let total: number = 0.0;
    this.shoppingCartItems.map(shoppingCartItem => {
      let object = shoppingCartItem.ListingItem;
      // if listing is loaded (async)
      if (object.PaymentInformation) {
        total += object.PaymentInformation.ItemPrice.basePrice
      }
    });
    return new Amount(total);
  }

  private setCartItems(): void {
    this.shoppingCartItems.map(shoppingCartItem => {
      let object = shoppingCartItem.ListingItem;
      if (object.ItemInformation) {
        shoppingCartItem.title = object.ItemInformation.title;
        shoppingCartItem.name = object.ItemInformation.ItemCategory.name;
        shoppingCartItem.thumbnail = this.getThumbnail(object.ItemInformation.ItemImages[0]);
      }
      if (object.PaymentInformation) {
        shoppingCartItem.integerPart = new Amount (object.PaymentInformation.ItemPrice.basePrice).getIntegerPart();
        shoppingCartItem.fractionPart = new Amount (object.PaymentInformation.ItemPrice.basePrice).getFractionalPart();
      }
    });
  }

  get countOfItems() { 
    return this.shoppingCartItems.length;
  }

  private getThumbnail(images: any) {
     if(images) {
        return images.ItemImageDatas.find(data => {
          return data.imageVersion === 'THUMBNAIL';
        });
      } 
      return undefined;
  }

}