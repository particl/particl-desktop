import { Bid } from './bid.model';
import * as _ from 'lodash';

export class BidCollection {
  orders: Bid[] = [];
  sellOrders: Array<Bid> = [];
  buyOrders: Array<Bid> = [];

  constructor(orders: Bid[], public address: string, public type?: string, public additionalFilter?: any) {
    this.setOrders(orders);
  }

  setOrders(orders: Bid[]) {
    this.orders = orders.reverse().map(ord => {
      return this.setBuySellOrder(ord);
    })
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
    // @TODO additionalFilter stuff should be remove once it handles via backend
    if (this.additionalFilter) {
      if (this.additionalFilter.requiredAttention) {
        return (this.type === 'sell' ? this.activeSellOrders : this.activeBuyOrders)
      }

      if (this.additionalFilter.hideCompleted) {
        return (this.type === 'sell' ? this.sellOrders : this.buyOrders).filter((o) => {
          return o.status !== 'complete'
        });
      }
    }
    return (this.type === 'sell' ? this.sellOrders : this.buyOrders);
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
