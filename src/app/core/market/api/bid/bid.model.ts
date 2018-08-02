import { Messages, DateFormatter } from 'app/core/util/utils';
import { Product } from './product.model';

export class Bid extends Product {
  activeBuySell: boolean;
  constructor(private order: any, public ordType: string ) {
    super();
    this.setActiveOrders();
  }

  get id() {
    return this.order.id;
  }

  get type() {
    return this.ordType;
  }

  get listingItemId() {
    return this.order.listingItemId
  }

  get ShippingAddress() {
    return this.order.ShippingAddress;
  }

  get status() {
    return Messages[this.allStatus].status;
  }

  get added() {
    return new DateFormatter(new Date(this.createdAt)).dateFormatter(false);
  }

  get updated() {
    return new DateFormatter(new Date(this.createdAt)).dateFormatter(false);
  }

  get messages() {
    return Messages[this.allStatus][this.type];
  }

  get OrderItem() {
    return this.order.OrderItem;
  }

  get ListingItem() {
    return this.order.ListingItem;
  }

  get allStatus() {
    return this.order.OrderItem.status ? this.order.OrderItem.status : this.order.action === 'MPA_REJECT' ? 'REJECTED' : 'BIDDING';
  }

  get createdAt() {
    return this.order.createdAt;
  }

  get updatedAt() {
    return this.order.updatedAt;
  }

  setActiveOrders() {
    this.activeBuySell = ['Accept bid', 'Mark as shipped', 'Mark as delivered', 'Make payment']
                          .includes(this.messages.action_button);
  }

}


