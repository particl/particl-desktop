import * as _ from 'lodash';
import { Amount } from 'app/core/util/utils';

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

  private setOrderKeys(ord: any) {
    // Required Testing on different Scenarios
    ord.status = ord.OrderItem.status ? ord.OrderItem.status : 'Bidding';
    switch (ord.status) {
      case 'Bidding':
        ord.action_button = this.type === 'buy' ? 'Waiting for seller' : 'Accept bid';
        ord.tooltip = this.type === 'buy' ? '' : 'Approve this order and sell to this buyer';
        ord.action_disabled = this.type === 'buy' ? true : false;
        break;
      case 'Awaiting (escrow)':
        ord.action_button = this.type === 'buy' ? 'Make Payment' : 'Waiting For Buyer';
        ord.tooltip = this.type === 'buy' ? 'Pay for your order and escrow' : 'Waiting for Buyers Payment';
        ord.action_disabled = this.type === 'buy' ? false : true;
      case 'Escrow':
        ord.action_button = this.type === 'buy' ? 'Waiting For Shipping' : 'Marked as Shipped';
        ord.tooltip = this.type === 'buy' ? '' : 'Confirmed that the order has been shipped to buyer';
        ord.action_disabled = this.type === 'buy' ? true : false;
        break;
      case 'Shipping':
        ord.action_button = this.type === 'buy' ? 'Mark as Delivered' : 'Waiting for Delivery';
        ord.tooltip = this.type === 'buy' ? 'Confirmed that you have received the order' :
          'Awaiting confirmation of Successfull delivery by the buyer';
        ord.action_disabled = this.type === 'buy' ? false : true;
        break;
      case 'Complete':
        ord.action_button = 'Order Complete';
        ord.tooltip = '';
        ord.action_disabled = false;
        break;  
      default:
        break;
    }    
  }
}
