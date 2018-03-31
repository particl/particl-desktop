import { Listing } from '../listing/listing.model';
import { Amount } from 'app/core/util/utils';
export class Cart {

  public shoppingCartItems: Array<any>;

  constructor(public cartDbObj: any) {
      this.shoppingCartItems = this.cartDbObj;
      this.setCartItems();
  }

  get subTotal(): Amount {
    let total = 0.0;
    this.shoppingCartItems.map(shoppingCartItem => {
      const object = shoppingCartItem.ListingItem;
      // if listing is loaded (async)
      if (object.PaymentInformation) {
        total += object.PaymentInformation.ItemPrice.basePrice
      }
    });
    return new Amount(total);
  }

  get shippingTotal(): Amount{
    let total: number = 0.0;
    this.shoppingCartItems.map(shoppingCartItem => {
      const object = shoppingCartItem.ListingItem;
      // if listing is loaded (async)
      if (object.PaymentInformation) {
        total += object.PaymentInformation.ItemPrice.ShippingPrice.international
      }
    });
    return new Amount(total);
  }

  get escrow(): Amount {
    let total: number = 0.0;
    this.shoppingCartItems.map(shoppingCartItem => {
      let object = shoppingCartItem.ListingItem;
      // if listing is loaded (async)
      if (object.PaymentInformation) {
        total += object.PaymentInformation.ItemPrice.basePrice + object.PaymentInformation.ItemPrice.ShippingPrice.international
      }
    });
    return new Amount(total);
  }

  get total(): Amount{
    let total: number = 0.0;
    this.shoppingCartItems.map(shoppingCartItem => {
      let object = shoppingCartItem.ListingItem;
      // if listing is loaded (async)
      if (object.PaymentInformation) {
        total += 2*(object.PaymentInformation.ItemPrice.basePrice + object.PaymentInformation.ItemPrice.ShippingPrice.international)
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
        shoppingCartItem.integerPart = new Amount (object.PaymentInformation.ItemPrice.basePrice).getIntegerPart();
        shoppingCartItem.fractionPart = new Amount (object.PaymentInformation.ItemPrice.basePrice).getFractionalPart();
        //Check if international needs USD to PART
        shoppingCartItem.shippingPriceIntegerPart = new Amount (object.PaymentInformation.ItemPrice.ShippingPrice.international).getIntegerPart();
        shoppingCartItem.shippingPriceFractionPart = new Amount (object.PaymentInformation.ItemPrice.ShippingPrice.international).getFractionalPart();
        shoppingCartItem.totalIntegerPart = new Amount (object.PaymentInformation.ItemPrice.basePrice + object.PaymentInformation.ItemPrice.ShippingPrice.international ).getIntegerPart();
        shoppingCartItem.totalFractionPart = new Amount (object.PaymentInformation.ItemPrice.basePrice + object.PaymentInformation.ItemPrice.ShippingPrice.international ).getFractionalPart();
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
