import { Template } from '../template/template.model';
import { Amount } from 'app/core/util/utils';
import { VoteDetails } from 'app/wallet/proposals/models/vote-details.model';

export class Listing extends Template {
  public favorite: boolean;
  public VoteDetails: VoteDetails;
  public errorMessage: string;
  constructor(private listing: any) {
      super(listing);
  }

  shippingAmount(country: string): Amount {
    return this.isDomestric(country) ? (
          this.domesticShippingPrice
        ) : (
          this.internationalShippingPrice
        )
  }

  escrowAmount(country: string): Amount {
    return this.isDomestric(country)  ? this.escrowPriceDomestic : this.escrowPriceInternational;
  }

  totalAmount(country: string): Amount {
    return this.isDomestric(country)  ? this.totalAmountDomestic : this.totalAmountInternaltional;
  }

  total(country: string): Amount {
    return this.isDomestric(country) ? this.domesticTotal : this.internationalTotal
  }

  isDomestric(country: string): boolean {
    const itemLocation = this.object.ItemInformation.ItemLocation;
    if (itemLocation) {
      return itemLocation.region === country;
    }
    return false;
  }
  /**
   * Returns if a listing is one of our own.
   * (Checks for the existence of a template).
   */
  get isMine(): boolean {
    return this.object.ListingItemTemplate && this.object.ListingItemTemplate.hash;
  }
}
