import { Category } from 'app/core/market/api/category/category.model';
import { DateFormatter, Amount } from 'app/core/util/utils';

export class Template {

  public category: Category = new Category({});
  public createdAt: string = '';
  public status: string = '';

  public basePrice: Amount = new Amount(0);
  public domesticShippingPrice: Amount = new Amount(0);
  public internationalShippingPrice: Amount = new Amount(0);
  public escrowPrice: Amount = new Amount(0);

  public domesticTotal: Amount = new Amount(0);
  public internationalTotal: Amount = new Amount(0);
  public totalAmount: Amount = new Amount(0);
  public memo: string = '';
  public allImages: Array<any> = new Array();

  // @TODO: remove type any
  constructor(private object: any) {
    this.category = new Category(this.object.ItemInformation.ItemCategory);
    this.createdAt = new DateFormatter(new Date(this.object.createdAt)).dateFormatter(true);

    this.setStatus();
    this.setBasePrice();
    this.setShippingPrice();
    this.setEscrowPrice();
    this.setTotal();
    this.setImages();
    this.setMemo();
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

  get isMine(): boolean {
    return this.object.ListingItemTemplate && this.object.ListingItemTemplate.hash;
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

  get country(): any {
    const itemlocation = this.object.ItemInformation.ItemLocation;
    if (itemlocation) {
      return itemlocation.region;
    }
    return undefined;
  }
  setStatus(): void {
    if (this.object.ListingItems && this.object.ListingItems.length > 0) {
      this.status = 'published';
    } else {
      this.status = 'unpublished';
    }
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

    // TODO add total for international and domestic.
    const total = this.escrowPrice.getAmount() + iTotal;
    this.totalAmount = new Amount(total);
  }

  setMemo(): void {
    const msg = this.object.ActionMessages;
    if (msg) {
      this.memo = msg.filter((info) => info.MessageInfo.memo).map(obj => obj.MessageInfo.memo)[0] || '';
    }
  }
  // May be required a model in future
  setImages(): void {
    const itemimage = this.object.ItemInformation.ItemImages;
    if (itemimage) {
      this.allImages = itemimage.filter((img, index) => (img.ItemImageDatas && index > 0))
                        .map(data => data.ItemImageDatas.find(o => o.imageVersion === 'THUMBNAIL'));
    }
  }

}
