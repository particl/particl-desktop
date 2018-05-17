import * as _ from 'lodash';
import { Amount, DateFormatter, Messages, setOrderKeys } from 'app/core/util/utils';
import { Listing
} from '../listing/listing.model';

export class Bid {
  public id: number;
  public orderItems: Array<any>;
  //  @TODO replace with product model
  public listing: Listing;
  public listingItemId: number;
  public status: string;

  // @TODO some refactoring needed
  public OrderItem: {
    status: string,
    id: number
  }

  constructor(public orders: any, public address: any, public type: any) {
    this.setFilter();
  }

  setFilter() {
    this.orderItems = [];
    const orders = [];
    _.each(this.orders, (order) => {
      if (this.type === 'buy' && order.bidder === this.address) {
        order = setOrderKeys(order, this.type);
        // this.orderItems.push(order)
        orders.push(order);
      }
      if (this.type === 'sell' && order.ListingItem.seller  === this.address) {
        order = setOrderKeys(order, this.type);
        // this.orderItems.push(order);
        orders.push(order);
      }
    })

    this.orders = orders;
  }

  get ordersCount() {
    return this.orders.length;
  }

}
