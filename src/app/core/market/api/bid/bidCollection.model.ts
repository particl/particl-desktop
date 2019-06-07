import { Bid } from './bid.model';
import * as _ from 'lodash';

export class BidCollection {
  orders: Bid[] = [];
  sellOrders: Array<Bid> = [];
  buyOrders: Array<Bid> = [];

  constructor(orders: Bid[], public address: string) {
    this.orders = orders.reverse().map(ord => {
      if (ord.bidder === this.address) {
        ord = new Bid(ord, 'buy');
        this.buyOrders.push(ord);
      }
      if (ord.ListingItem && ord.ListingItem.seller  === this.address) {
        ord = new Bid(ord, 'sell');
        this.sellOrders.push(ord);
      }
      return ord;
    });
  }

  get sellOrdersCount(): number {
    return this.sellOrders.length;
  }

  get buyOrdersCount(): number {
    return this.buyOrders.length;
  }

  get activeSellOrders(): Bid[] {
    if (this.sellOrdersCount > 0) {
      return this.sellOrders.filter((ord) => ord.activeBuySell);
    }
    return [];
  }

  get activeBuyOrders(): Bid[] {
    if (this.buyOrdersCount > 0) {
      return this.buyOrders.filter((ord) => ord.activeBuySell);
    }
    return [];
  }

  get activeSellOrderCount(): number {
    return this.activeSellOrders.length;
  }

  get activeBuyOrderCount(): number {
    return this.activeBuyOrders.length;
  }

  get ordersCount(): number {
    return this.orders.length;
  }

  get buyCount(): number {
    const count = this.activeBuyOrderCount;
    if (count > 0) {
      return count;
    }
    return undefined;
  }

  get sellCount(): number {
    const count = this.activeSellOrderCount;
    if (count > 0) {
      return count;
    }
    return undefined;
  }

}
