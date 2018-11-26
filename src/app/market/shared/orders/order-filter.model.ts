import { Bid } from 'app/core/market/api/bid/bid.model';

export class OrderFilter {
  order_filtering: Array<any> = [
    { title: 'All orders', value: '*',               amount: 0 },
    { title: 'Bidding',    value: 'MPA_BID',         amount: 0 },
    { title: 'Awaiting',   value: 'AWAITING_ESCROW', amount: 0 },
    { title: 'In escrow',  value: 'ESCROW_LOCKED',   amount: 0 },
    { title: 'Shipped',    value: 'SHIPPING',        amount: 0 },
    { title: 'Completed',  value: 'COMPLETE',        amount: 0 },
    { title: 'Rejected',   value: 'MPA_REJECT',      amount: 0 }
  ];
  constructor() {
  }

  setOrderStatusCount(filterString: string, orders: Bid[]): void {
    switch (filterString) {

      case 'MPA_BID':
        this.setBiddingCount(orders.length);
        break;

      case 'AWAITING_ESCROW':
        this.setAwaitingCount(orders.length);
        break;

      case 'ESCROW_LOCKED':
        this.setEscrowCount(orders.length);
        break;

      case 'SHIPPING':
        this.setShippedCount(orders.length);
        break;

      case 'COMPLETE':
        this.setSoldCount(orders.length);
        break;

      case 'MPA_REJECT':
        this.setRejectedCount(orders.length);
        break;

      default:
        this.allStatusCount(orders);
        break;
    }
  }

  allStatusCount(orders: Bid[]): void {
    this.resetAllCount();
    this.setAllCount(orders.length);
    orders.map(ord => {
      switch (ord.status) {

        case 'bidding':
          this.increaseBiddingCount();
          break;

        case 'awaiting':
          this.increaseAwaitingCount();
          break;

        case 'escrow':
          this.increaseEscrowCount();
          break;

        case 'shipping':
          this.increaseShippedCount();
          break;

        case 'complete':
          this.increaseSoldCount();
          break;

        case 'rejected':
          this.increaseRejectedCount();
          break;
      }
    })
  }

  setAllCount(count: number): void {
    this.order_filtering[0].amount = count;
  }

  setBiddingCount(count: number): void {
    this.order_filtering[1].amount = count;
  }

  setAwaitingCount(count: number): void {
    this.order_filtering[2].amount = count;
  }

  setEscrowCount(count: number): void {
    this.order_filtering[3].amount = count;
  }

  setShippedCount(count: number): void {
    this.order_filtering[4].amount = count;
  }

  setSoldCount(count: number): void {
    this.order_filtering[5].amount = count;
  }

  setRejectedCount(count: number): void {
    this.order_filtering[6].amount = count;
  }

  resetAllCount(): void {
    this.setBiddingCount(0);
    this.setAwaitingCount(0);
    this.setEscrowCount(0);
    this.setShippedCount(0);
    this.setSoldCount(0);
    this.setRejectedCount(0);
  }

  increaseBiddingCount(): void {
    this.order_filtering[1].amount += 1;
  }

  increaseAwaitingCount(): void {
    this.order_filtering[2].amount += 1;
  }

  increaseEscrowCount(): void {
    this.order_filtering[3].amount += 1;
  }

  increaseShippedCount(): void {
    this.order_filtering[4].amount += 1;
  }

  increaseSoldCount(): void {
    this.order_filtering[5].amount += 1;
  }

  increaseRejectedCount(): void {
    this.order_filtering[6].amount += 1;
  }

}
