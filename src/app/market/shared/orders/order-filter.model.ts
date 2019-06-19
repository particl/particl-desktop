import { Bid } from 'app/core/market/api/bid/bid.model';
import { OrderData } from 'app/core/util/utils';
import { sortBy } from 'lodash';

export class OrderFilter {

  private _filters: Array<any> = [];

  constructor(orders: Bid[]) {
    const all: any = {
      title: 'All orders',
      value: '*',
      count: 0,
      filter: '',
      order: 0
    };
    const itemKeys = Object.keys(OrderData);
    const newFilters: any[] = [];
    for (const key of itemKeys) {
      const filterData = OrderData[key].filter || {};
      if (typeof filterData.text === 'string') {
        newFilters.push({
          title: filterData.text,
          value: filterData.query,
          count: 0,
          filter: OrderData[key].orderStatus || '',
          order: filterData.order
        });
      }
      this._filters = [
        all,
        ...(sortBy(newFilters, ['order']))
      ];
    }
    this.setCounts(orders);
  }

  setFilterCount(status: string, count: number) {
    if (count < 0) {
      return;
    }
    const filter = this.findFilter(status);
    if (filter) {
      filter.count = +count;
    }
  }

  private findFilter(status: string): any|undefined {
    return this._filters.find((f) => f.filter === status);
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
