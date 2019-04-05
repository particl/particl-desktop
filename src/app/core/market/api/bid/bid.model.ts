import { Messages, DateFormatter } from 'app/core/util/utils';
import { Product } from './product.model';
import { Listing } from '../listing/listing.model';

export class Bid extends Product {
  activeBuySell: boolean;
  constructor(private order: any, public ordType: string ) {
    super();
    this.setActiveOrders();
  }

  get id(): number {
    return this.order.id;
  }

  get type(): string {
    return this.ordType;
  }

  get listingItemId(): number {
    return this.order.listingItemId
  }

  get ShippingAddress(): any {
    return this.order.ShippingAddress;
  }

  get status(): string {
    return Messages[this.allStatus].status;
  }

  get added(): string {
    return new DateFormatter(new Date(this.createdAt)).dateFormatter(false);
  }

  get updated(): string {
    return new DateFormatter(new Date(this.updatedAt)).dateFormatter(false);
  }

  get messages(): any {
    return Messages[this.allStatus][this.type];
  }

  get OrderItem(): any {
    return this.order.OrderItem;
  }

  get ListingItem(): any {
    return this.order.ListingItem;
  }

  get allStatus(): string {
    return this.order.OrderItem.status ? this.order.OrderItem.status : this.order.action === 'MPA_REJECT' ? 'REJECTED' : 'BIDDING';
  }

  get createdAt(): number {
    return this.order.createdAt;
  }

  get updatedAt(): number {
    return this.order.updatedAt;
  }

  set listing(listing: Listing) {
    this.order.listing = listing;
  }

  get hash(): string {
    if (this.order.ListingItem && this.order.ListingItem.hash) {
      return this.order.ListingItem.hash.substring(0, 3);
    }
    return '';
  }

  get hashDetail(): string {
    if (this.order.ListingItem && this.order.ListingItem.hash) {
      return this.order.ListingItem.hash.substring(0, 6);
    }
    return '';
  }

  get listing(): Listing {
    return this.order.listing;
  }

  setActiveOrders() {
    this.activeBuySell = ['Accept bid', 'Mark as shipped', 'Mark as delivered', 'Make payment']
                          .includes(this.messages.action_button);
  }

}
