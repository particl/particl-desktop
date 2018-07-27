import * as _ from 'lodash';
import { Order } from 'app/core/market/api/bid/order.model';
import { Listing
} from '../listing/listing.model';

export class Bid {
  public id: number;
  //  @TODO replace with product model
  public listing: Listing;
  public listingItemId: number;
  public status: string;
  private bid: Order;

  // @TODO some refactoring needed
  public OrderItem: {
    status: string,
    id: number
  }
  // @TODO required its own model ?
  public ShippingAddress: {
    country: string
  }

  constructor(public orders: any, public address: any, public type?: any) {
    this.setFilter();
  }

  setFilter() {
    this.bid = new Order(this.orders, this.address);
    this.orders = this.type === 'buy' ? this.bid.buyOrders : this.bid.sellOrders;
  }

  get ordersCount() {
    return this.orders.length;
  }

  get buyCount() {
    const count = this.bid.activeBuyOrderCount;
    if (count > 0) {
      return count;
    }
    return undefined;
  }

  get sellCount() {
    const count = this.bid.activeSellOrderCount;
    if (count > 0) {
      return count;
    }
    return undefined;
  }

}
