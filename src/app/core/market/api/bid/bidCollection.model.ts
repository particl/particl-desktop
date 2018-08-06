import { Bid } from './bid.model';
import * as _ from 'lodash';

export class BidCollection {
  sellOrders: Array<Bid> = [];
  buyOrders: Array<Bid> = [];

  constructor(public orders: Bid[], public address: string, public type?: string) {
    this.setOrders();
  }

  setOrders() {
    this.orders = this.orders.map(ord => {
      return this.setBuySellOrder(ord);
    })
    this.sellOrders.reverse()
    this.buyOrders.reverse()
    this.orders.reverse();
  }

  setBuySellOrder(ord: Bid) {
    if (ord.bidder === this.address) {
      ord = new Bid(ord, 'buy');
      this.buyOrders.push(ord);
    }
    if (ord.ListingItem && ord.ListingItem.seller  === this.address) {
      ord = new Bid(ord, 'sell');
      this.sellOrders.push(ord);
    }
    return ord;
  }

  get filterOrders(): Bid[] {
    return (this.type === 'sell' ? this.sellOrders : this.buyOrders);
  }

  get sellOrdersCount(): number {
    return this.sellOrders.length;
  }

  get buyOrdersCount(): number {
    return this.buyOrders.length;
  }

  get activeSellOrderCount(): number {
    if (this.sellOrdersCount > 0) {
      return this.sellOrders.filter((ord) => ord.activeBuySell).length;
    }
    return 0;
  }

  get activeBuyOrderCount(): number {
    if (this.buyOrdersCount > 0) {
      return this.buyOrders.filter((ord) => ord.activeBuySell).length;
    }
    return 0;
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
