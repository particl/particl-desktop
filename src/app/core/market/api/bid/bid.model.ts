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
  // @TODO required its own models ?
  public sellOrders: Array<any>;
  public buyOrders: Array<any>;
  // @TODO some refactoring needed
  public OrderItem: {
    status: string,
    id: number
  }
  // @TODO required its own model ?
  public ShippingAddress: {
    country: string
  }

  constructor(public orders: any, public address: any, public type: any) {
    this.setFilter();
  }

  setFilter() {
    this.orderItems = [];
    this.buyOrders = [];
    this.sellOrders = [];
    _.each(this.orders, (order) => {

      if (order.bidder === this.address) {
        order = setOrderKeys(order, 'buy');
        // this.orderItems.push(order)
        this.buyOrders.push(order);
      }
      if (order.ListingItem.seller  === this.address) {
        order = setOrderKeys(order, 'sell');
        // this.orderItems.push(order);
        this.sellOrders.push(order);
      }
    })
    this.orders = this.type === 'buy' ? this.buyOrders : this.sellOrders;
  }

  get ordersCount() {
    return this.orders.length;
  }

  get sellOrdersCount() {
    return this.sellOrders.length;
  }

  get buyOrdersCount() {
    return this.buyOrders.length;
  }

  get activeSellOrderCount() {
    if (this.sellOrdersCount > 0) {
      return this.buyOrders.filter((ord) => ['Accept bid', 'Mark as shipped']
        .includes(ord.messages.action_button)).length;
    }
    return 0;
  }

  get activeBuyOrderCount() {
    if (this.buyOrdersCount > 0) {
      return this.buyOrders.filter((ord) => ['Mark as delivered', 'Make payment']
        .includes(ord.messages.action_button)).length;
    }
    return 0;
  }

}
