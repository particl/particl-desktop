import { Category } from 'app/core/market/api/category/category.model';
import { DateFormatter, Amount } from 'app/core/util/utils';

export class Template {

  public category: Category = new Category({});
  public createdAt: string = '';

  public basePrice: Amount = new Amount(0);
  public domesticShippingPrice: Amount = new Amount(0);
  public internationalShippingPrice: Amount = new Amount(0);
  public escrowPrice: Amount = new Amount(0);

  public domesticTotal: Amount = new Amount(0);
  public internationalTotal: Amount = new Amount(0);

  // @TODO: remove type any
  constructor(private object: any) {
    this.category = new Category(this.object.ItemInformation.ItemCategory);
    this.createdAt = new DateFormatter(new Date(this.object.createdAt)).dateFormatter(true);

    this.setBasePrice();
    this.setShippingPrice();
    this.setEscrowPrice();
    this.setTotal();
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

  get hash(): string {
    return this.object.hash;
  }
  // Status
  get status(): string {
    if (this.object.ListingItemObjects.length > 0) {
      return 'published';
    } else {
      return 'unpublished';
    }
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

  setBasePrice(): void {
    this.basePrice = (this.object.PaymentInformation.ItemPrice
      ? new Amount(this.object.PaymentInformation.ItemPrice.basePrice)
      : this.basePrice);
  }

  setShippingPrice(): void {
    const itemPrice = this.object.PaymentInformation.ItemPrice;
    if (itemPrice && itemPrice.ShippingPrice) {
      this.domesticShippingPrice = (itemPrice.ShippingPrice.domestic
        ? new Amount(itemPrice.ShippingPrice.domestic) : this.domesticShippingPrice);
      this.internationalShippingPrice = (itemPrice.ShippingPrice.international
        ? new Amount(itemPrice.ShippingPrice.international) :  this.internationalShippingPrice);
    }
  }

  setEscrowPrice(): void {
    const itemPrice = this.object.PaymentInformation.ItemPrice;
    const escrow = this.object.PaymentInformation.Escrow;
    if (itemPrice === undefined || escrow === undefined) {
      return;
    }

    const basePrice = itemPrice.basePrice;
    const ratio = escrow.Ratio;
    if (basePrice === undefined || ratio === undefined) {
      return;
    }

    const total = (ratio.buyer / 100) * (basePrice + this.internationalShippingPrice.getAmount());

    this.escrowPrice = new Amount(total);
  }

  setTotal(): void {
    let iTotal = this.basePrice.getAmount();
    let dTotal = this.basePrice.getAmount();

    iTotal += this.internationalShippingPrice.getAmount();
    dTotal += this.domesticShippingPrice.getAmount();

    this.internationalTotal = new Amount(iTotal);
    this.domesticTotal = new Amount(dTotal);
  }

}
