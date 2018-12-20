import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { Category } from 'app/core/market/api/category/category.model';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable()
export class CategoryService {

  constructor(private market: MarketService,
              private marketState: MarketStateService) {
  }

  list() {
    return this.marketState.observe('category')
      .pipe(distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)))
      .pipe(map((v => new Category(v))));
  }

  add(categoryName: string, description: string, parent: string | number): Observable<any> {
    return this.market.call('category', ['add', categoryName, description, parent]);
  }

  update(categoryId: number, categoryName: string, description: string, parent?: number): Observable<any> {
    const params = ['update', categoryId, categoryName, description, parent];
    if (parent === null) {
      params.pop(); // if null pop parent
    }
    return this.market.call('category', params);
  }

  remove(categoryId: number): Observable<any> {
    return this.market.call('category', ['remove', categoryId]);
  }

  search(searchString: string): Observable<any> {
    return this.market.call('category', ['search', searchString]);
  }

}
