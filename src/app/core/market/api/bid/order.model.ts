import * as _ from 'lodash';
import { Messages, setOrderKeys } from 'app/core/util/utils';

export class Order {
  public sellOrders: Array<any>;
  public buyOrders: Array<any>;

  constructor(public orders: any, public address: any) {
    this.setOrders();
  }

  setOrders() {
    this.buyOrders = [];
    this.sellOrders = [];
    _.each(this.orders, (order) => {

      if (order.bidder === this.address) {
        order = setOrderKeys(order, 'buy');
        this.buyOrders.push(order);
      }
      if (order.ListingItem.seller  === this.address) {
        order = setOrderKeys(order, 'sell');
        this.sellOrders.push(order);
      }
    })
  }

  get sellOrdersCount() {
    return this.sellOrders.length;
  }

  get buyOrdersCount() {
    return this.buyOrders.length;
  }

  get activeSellOrderCount() {
    if (this.sellOrdersCount > 0) {
      return this.sellOrders.filter((ord) => ['Accept bid', 'Mark as shipped']
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
