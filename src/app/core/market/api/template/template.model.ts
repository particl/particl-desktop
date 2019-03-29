import { Category } from 'app/core/market/api/category/category.model';
import { DateFormatter, Amount, Duration } from 'app/core/util/utils';
import { ImageCollection } from 'app/core/market/api/template/image/imagecollection.model';
import { VoteOption } from 'app/wallet/proposals/models/vote-option.model';
export class Template {

  public category: Category = new Category({});
  public createdAt: string = '';
  public status: string = '';

  public basePrice: Amount = new Amount(0);
  public domesticShippingPrice: Amount = new Amount(0);
  public internationalShippingPrice: Amount = new Amount(0);
  public escrowPriceInternational: Amount = new Amount(0);
  public escrowPriceDomestic: Amount = new Amount(0);

  public domesticTotal: Amount = new Amount(0);
  public internationalTotal: Amount = new Amount(0);
  public totalAmountInternaltional: Amount = new Amount(0);
  public totalAmountDomestic: Amount = new Amount(0);
  public memo: string = '';
  public imageCollection: ImageCollection;
  public expireTime: number = 4;
  public isFlagged: boolean = false;
  public proposalHash: string = '';
  public keepItem: VoteOption;
  public removeItem: VoteOption;
  public submitterAddress: string = '';
  public expiredTime: string = '';

  // @TODO: remove type any
  constructor(public object: any) {
    this.category = new Category(this.object.ItemInformation.ItemCategory);
    this.createdAt = new DateFormatter(new Date(this.object.createdAt)).dateFormatter(true);
    this.imageCollection = new ImageCollection(this.object.ItemInformation.ItemImages)
    this.expiredTime = new DateFormatter(new Date(this.object.expiredAt)).dateFormatter(true);

    this.setStatus();
    this.setBasePrice();
    this.setShippingPrice();
    this.setEscrowPrice();
    this.setTotal();
    this.setMemo();
    this.setListingFlagged();
    this.setExpiryTime();
    this.setProposalHash();
    this.setProposalOptions();
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

  // TODO: check if expired.
  get isPublished(): boolean {
    return this.object.ListingItems && this.object.ListingItems.length > 0;
  }

  get isUnpublished(): boolean {
    return this.status === 'unpublished';
  }

  get country(): any {
    const itemlocation = this.object.ItemInformation.ItemLocation;
    if (itemlocation) {
      return itemlocation.region;
    }
    return undefined;
  }
  setStatus(): void {
    if (this.isPublished) {
      this.status = !this.isTempExpired ? 'published' : 'expired';
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

    const totalDomestic = (ratio.buyer / 100) * (basePrice + this.domesticShippingPrice.getAmount());
    const totalInternational = (ratio.buyer / 100) * (basePrice + this.internationalShippingPrice.getAmount());

    this.escrowPriceDomestic = new Amount(totalDomestic);
    this.escrowPriceInternational = new Amount(totalInternational);
  }

  setTotal(): void {
    let iTotal = this.basePrice.getAmount();
    let dTotal = this.basePrice.getAmount();

    iTotal += this.internationalShippingPrice.getAmount();
    dTotal += this.domesticShippingPrice.getAmount();

    this.internationalTotal = new Amount(iTotal);
    this.domesticTotal = new Amount(dTotal);

    // TODO add total for international and domestic.
    const totalDomestic = this.escrowPriceDomestic.getAmount() + dTotal;
    const totalInternational = this.escrowPriceInternational.getAmount() + iTotal;

    this.totalAmountDomestic = new Amount(totalDomestic);
    this.totalAmountInternaltional = new Amount(totalInternational);
  }

  setMemo(): void {
    const msg = this.object.ActionMessages;
    if (msg) {
      this.memo = msg.filter((info) => info.MessageInfo.memo).map(obj => obj.MessageInfo.memo)[0] || '';
    }
  }


  setListingFlagged(): void {
    this.isFlagged = this.flaggedItem && Object.keys(this.flaggedItem).length > 0;
  }

  setProposalHash(): void {
    if (this.flaggedItem && this.flaggedItem.Proposal) {
      this.proposalHash = this.flaggedItem.Proposal.hash;
    }
  }

  setProposalOptions(): void {
    if (this.flaggedItem && this.flaggedItem.Proposal) {
      this.submitterAddress = this.flaggedItem.Proposal.submitter;
      this.flaggedItem.Proposal.ProposalOptions.forEach(opt => {
        if (opt.description === 'KEEP') {
          this.keepItem = opt;
        } else {
          this.removeItem = opt;
        }
      });
    }
  }

  get flaggedItem(): any {
    return this.object.FlaggedItem;
  }

  get expiredAt(): any {
    return  this.checkListingItems ? 'Expires ' + new DateFormatter(
      new Date(this.object.ListingItems[0].expiredAt)
      ).dateFormatter(false).substr(0, 16) : '';
  }

  get isAboutToExpire(): Boolean {

    // 86400000 m seconds in one day.
    return (this.object.expiredAt > +new Date() && ((this.object.expiredAt - +new Date()) <= 86400000));
  }

  get expireIn(): String {
    return new Duration((this.object.expiredAt - Date.now()) / 1000).getReadableDuration();
  }

  get isTempExpired(): boolean {
    if (this.checkListingItems) {
      return this.object.ListingItems[0].expiredAt < +new Date()
    }
    return false;
  }

  get checkListingItems(): boolean {
    return Object.prototype.toString.call(this.object.ListingItems) === '[object Array]' && this.object.ListingItems.length;
  }

  setExpiryTime(): void {
    if (this.checkListingItems) {
      this.expireTime = this.object.ListingItems[0].expiryTime;
    }
  }

}
