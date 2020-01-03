
import * as _ from 'lodash';

import { Listing } from '../listing/listing.model';
import { PartoshiAmount } from 'app/core/util/utils';

export class Cart {

  private items: Array<Listing> = [];
  private subTotal: PartoshiAmount = new PartoshiAmount(0);

  constructor(object: Array<any>) {
      const items = _.cloneDeep(object);
      this.items = items.map( (item: any) => {
        const listing = new Listing(item.ListingItem);
        this.subTotal.add(listing.basePrice);
        return listing;
      });
  }

  getShippingTotal(country: string): PartoshiAmount {
    const total = new PartoshiAmount(0);
    this.listings.forEach(listing => {
      total.add(listing.shippingAmount(country));
    });
    return total;
  }

  getEscrowTotal(country: string): PartoshiAmount {
    const total = new PartoshiAmount(0);
    this.listings.forEach(listing => {
      total.add(listing.escrowAmount(country));
    });
    return total;
  }

  getTotal(country: string): PartoshiAmount {
    const total = new PartoshiAmount(0);
    total.add(this.subTotal).add(this.getShippingTotal(country)).add(this.getEscrowTotal(country));
    return total;
  }

  getSubTotalWithoutShipping(): PartoshiAmount {
    return this.subTotal;
  }

  getSubTotalWithShippingTotal(country: string): PartoshiAmount {
    const total = new PartoshiAmount(0);
    return total.add(this.subTotal).add(this.getShippingTotal(country));
  }

  get countOfItems(): number {
    return this.listings.length;
  }

  get listings(): Listing[] {
    return this.items;
  }
}
