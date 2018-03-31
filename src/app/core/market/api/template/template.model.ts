import { Category } from 'app/core/market/api/category/category.model';
import { DateFormatter, Amount } from 'app/core/util/utils';

export class Template {

  public category: Category = new Category({});
  public createdAt: string = '';

  public basePrice: Amount = new Amount(0);
  public domesticShippingPrice: Amount = new Amount(0);
  public internationalShippingPrice: Amount = new Amount(0);

  // @TODO: remove type any
  constructor(private object: any) {
    this.category = new Category(this.object.ItemInformation.ItemCategory);
    this.createdAt = new DateFormatter(new Date(this.object.createdAt)).dateFormatter(true);

    this.setBasePrice();
    this.setShippingPrice();

    console.log('item obj l' + this.object.ListingItemObjects.length);
  }

  get id(): number {
    return this.object.id
  }

  get title(): string {
    return this.object.ItemInformation.title
  }

  get shortDescription(): string {
    return this.object.ItemInformation.shortDescription
  }

  get longDescription(): string {
    return this.object.ItemInformation.longDescription
  }

  // Status
  get status(): string {
    if (this.object.ListingItemObjects.length > 0) {
      return 'Published';
    } else {
      return 'Unpublished';
    }
  }

  get statusClass(): String {
    return this.status.toLocaleLowerCase()
  }

  get thumbnail(): any {
    const itemimage = this.object.ItemInformation.ItemImages[0];
    if (itemimage) {
      return itemimage.ItemImageDatas.find(data => {
        return data.imageVersion === 'THUMBNAIL';
      });
    }
    return undefined;
  }

  get featuredImage(): any {
    const itemimage = this.object.ItemInformation.ItemImages[0];
    if (itemimage) {
      return itemimage.ItemImageDatas.find(data => {
        return data.imageVersion === 'MEDIUM';
      });
    }
    return undefined;
  }

  get images(): any {
    return this.object.ItemInformation.ItemImages;
  }

  get intPrice(): number {
    return this.basePrice.getIntegerPart();
  }

  get centsPrice(): number {
    return this.basePrice.getFractionalPart();
  }

  setBasePrice(): void {
    this.basePrice = (this.object.PaymentInformation.ItemPrice
      ? new Amount(this.object.PaymentInformation.ItemPrice.basePrice)
      : undefined);
  }

  setShippingPrice(): void {
    const itemPrice = this.object.PaymentInformation.ItemPrice;
    if (itemPrice && itemPrice.ShippingPrice) {
      this.domesticShippingPrice = (itemPrice.ShippingPrice.domestic
        ? new Amount(itemPrice.ShippingPrice.domestic) : undefined);
      this.internationalShippingPrice = (itemPrice.ShippingPrice.international
        ? new Amount(itemPrice.ShippingPrice.international) : undefined);
    }
  }
}
