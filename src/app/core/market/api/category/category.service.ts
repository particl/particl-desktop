import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';

import { Category } from 'app/core/market/api/category/category.model';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Injectable()
export class CategoryService {
  private categories: BehaviorSubject<Category> = new BehaviorSubject(null);

  private category$: Subscription;

  constructor(private market: MarketService) {}

  start() {
    this.loadCategories();
  }

  loadCategories () {
    this.category$ = this.market.call('category', ['list']).subscribe(
      resp => {
        if (resp && resp.name) {
          this.categories.next(new Category(resp));
        }
      },
      (error) => {
        this.loadCategories();
      }
    )
  }

  stop() {
    this.category$.unsubscribe();
  }

  list() {
    return this.categories;
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
