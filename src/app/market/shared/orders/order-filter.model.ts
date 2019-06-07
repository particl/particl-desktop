import { Bid } from 'app/core/market/api/bid/bid.model';
import { ORDER_DATA } from 'app/core/util/utils';
import { sortBy } from 'lodash';

export class OrderFilter {

  private _filters: Array<any> = [
    // { title: 'All orders',      value: '*',               count: 0 },
    // { title: 'Bids',            value: 'BIDDED',          count: 0 },
    // { title: 'Awaiting Escrow', value: 'AWAITING_ESCROW', count: 0 },
    // { title: 'Escrow Pending',  value: 'ESCROW_PENDING',  count: 0 },
    // { title: 'In escrow',       value: 'ESCROW_LOCKED',   count: 0 },
    // { title: 'Shipping',        value: 'SHIPPING',        count: 0 },
    // { title: 'Completed',       value: 'COMPLETE',        count: 0 },
    // { title: 'Rejected',        value: 'MPA_REJECT',      count: 0 }
  ];

  constructor(orders: Bid[]) {
    const all: any = {
      title: 'All orders',
      value: '*',
      count: 0,
      filter: '',
      order: 0
    };
    const itemKeys = Object.keys(ORDER_DATA);
    for (const key of itemKeys) {
      const filterData = ORDER_DATA[key].filter || {};
      if (typeof filterData.text === 'string') {
        this._filters.push({
          title: filterData.text,
          value: filterData.query,
          count: 0,
          filter: ORDER_DATA[key].orderStatus || '',
          order: filterData.order
        });
      }
      this._filters = [
        all,
        ...(sortBy(this._filters, ['order']))
      ];
    }
    this.setCounts(orders);
  }

  private setCounts(orders: Bid[]) {
    for (const order of orders) {
      const filterIdx = this._filters.findIndex((val: any) => val.filter === order.allStatus);
      if (filterIdx !== -1) {
        this._filters[filterIdx].count += 1;
        this._filters[0].count += 1;
      }
    }
  }

  get filters(): Array<any> {
    return this._filters;  // probably should clone or freeze this._filters before returning them
  }

}
