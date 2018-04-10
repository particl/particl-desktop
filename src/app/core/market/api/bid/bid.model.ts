import * as _ from 'lodash';
import { Amount, DateFormatter, Messages } from 'app/core/util/utils';

export class Bid {
  public orderItems: Array<any>;

  constructor(public orders: any, public address: any, public type: any) {
    this.setFilter();
  }

  setFilter() {
    this.orderItems = [];
    _.each(this.orders, (order) => {
      if (this.type === 'buy' && order.bidder === this.address) {
        this.setOrderKeys(order);
        this.orderItems.push(order)
      }
      if (this.type === 'sell' && order.ListingItem.seller  === this.address) {
        this.setOrderKeys(order);
        this.orderItems.push(order);
      }
    })
  }

  get ordersCount() {
    return this.orderItems.length;
  }

  // Required Testing on different Scenarios
  private setOrderKeys(ord: any) {
    // once the order has been accepted then we get status in orderItem
    ord.status = ord.OrderItem.status ? ord.OrderItem.status : 'Bidding';
    ord.added = new DateFormatter(new Date(ord.createdAt)).dateFormatter(true);
    ord.updated = new DateFormatter(new Date(ord.updatedAt)).dateFormatter(true);
    ord.messages = Messages[ord.status][this.type];
  }
}
