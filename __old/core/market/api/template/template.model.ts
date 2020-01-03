import { Category } from 'app/core/market/api/category/category.model';
import { DateFormatter, Duration, PartoshiAmount } from 'app/core/util/utils';
import { ImageCollection } from 'app/core/market/api/template/image/imagecollection.model';
import { VoteOption } from 'app/wallet/proposals/models/vote-option.model';
export class Template {

  public category: Category = new Category({});
  public createdAt: string = '';
  public status: string = '';

  public basePrice: PartoshiAmount = new PartoshiAmount(0);
  public domesticShippingPrice: PartoshiAmount = new PartoshiAmount(0);
  public internationalShippingPrice: PartoshiAmount = new PartoshiAmount(0);
  public escrowPriceInternational: PartoshiAmount = new PartoshiAmount(0);
  public escrowPriceDomestic: PartoshiAmount = new PartoshiAmount(0);

  public domesticTotal: PartoshiAmount = new PartoshiAmount(0);
  public internationalTotal: PartoshiAmount = new PartoshiAmount(0);
  public totalAmountInternaltional: PartoshiAmount = new PartoshiAmount(0);
  public totalAmountDomestic: PartoshiAmount = new PartoshiAmount(0);
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
    return (typeof this.object.hash === 'string') && (this.object.hash.length > 0);
  }

  get isUnpublished(): boolean {
    return this.status === 'unpublished';
  }

  get country(): any {
    const itemlocation = this.object.ItemInformation.ItemLocation;
    if (itemlocation) {
      return itemlocation.country;
    }
    return undefined;
  }
  setStatus(): void {
    let status = 'unpublished';
    if (this.isPublished) {
      if (this.checkListingItems) {
        status = this.object.ListingItems[0].expiredAt &&
          (this.object.ListingItems[this.object.ListingItems.length - 1].expiredAt >= +new Date())
          ? 'published' : 'expired';
      } else {
        // listing item is either awaiting publishing or is expired and had no bids on it so the associated listings have been deleted
        // ie: there are no listings

        // @TODO: zaSmilingIdiot (2019-11-13):
        //  This determines the awaiting state by checking whether the published template was generated at least x minutes ago...
        //  This is currently needed because there is no difference between
        //    - an awaiting template (a published template with no associated listing - still waiting for blockchain distribution), and
        //    - an expired template with no listings (a template with expired listings removed)
        // There needs to be a better way for this though.
        status = this.object.generatedAt && ( (+this.object.updatedAt + (1000 * 60 * 60 * 2)) > +new Date()) ? 'awaiting' : 'expired';
      }
    }

    this.status = status;
  }
  setBasePrice(): void {
    this.basePrice = (this.object.PaymentInformation.ItemPrice
      ? new PartoshiAmount(this.object.PaymentInformation.ItemPrice.basePrice || 0)
      : this.basePrice);
  }
  setShippingPrice(): void {
    const itemPrice = this.object.PaymentInformation.ItemPrice;
    if (itemPrice && itemPrice.ShippingPrice) {
      this.domesticShippingPrice = (itemPrice.ShippingPrice.domestic
        ? new PartoshiAmount(itemPrice.ShippingPrice.domestic) : this.domesticShippingPrice);
      this.internationalShippingPrice = (itemPrice.ShippingPrice.international
        ? new PartoshiAmount(itemPrice.ShippingPrice.international) :  this.internationalShippingPrice);
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

    const totalDomestic = (ratio.buyer / 100) * (basePrice + this.domesticShippingPrice.partoshis());
    const totalInternational = (ratio.buyer / 100) * (basePrice + this.internationalShippingPrice.partoshis());

    this.escrowPriceDomestic = new PartoshiAmount(totalDomestic);
    this.escrowPriceInternational = new PartoshiAmount(totalInternational);
  }

  setTotal(): void {
    let iTotal = this.basePrice.partoshis();
    let dTotal = this.basePrice.partoshis();

    iTotal += this.internationalShippingPrice.partoshis();
    dTotal += this.domesticShippingPrice.partoshis();

    this.internationalTotal = new PartoshiAmount(iTotal);
    this.domesticTotal = new PartoshiAmount(dTotal);

    const totalDomestic = this.escrowPriceDomestic.partoshis() + dTotal;
    const totalInternational = this.escrowPriceInternational.partoshis() + iTotal;

    this.totalAmountDomestic = new PartoshiAmount(totalDomestic);
    this.totalAmountInternaltional = new PartoshiAmount(totalInternational);
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
    return this.checkListingItems ? new DateFormatter(
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

  get checkListingItems(): boolean {
    return Object.prototype.toString.call(this.object.ListingItems) === '[object Array]' && this.object.ListingItems.length;
  }

  setExpiryTime(): void {
    if (this.checkListingItems) {
      this.expireTime = this.object.ListingItems[0].expiryTime;
    }
  }

}
