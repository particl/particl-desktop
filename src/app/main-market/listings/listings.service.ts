import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, retryWhen } from 'rxjs/operators';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';

import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { RespCategoryList, RespMarketListMarketItem } from '../shared/market.models';
import { CategoryItem, Market } from './listings.models';


@Injectable()
export class ListingsService {

  constructor(
    private _rpc: MarketRpcService
  ) {}


  loadCategories(marketKey: string): Observable<CategoryItem[]> {
    return this._rpc.call('category', ['list']).pipe(
      retryWhen(genericPollingRetryStrategy()),
      map((category: RespCategoryList) => {
        const parsed = this.parseCategories(category, marketKey);
        return parsed.children;
      })
    );
  }


  loadMarkets(profileId: number, identityId: number): Observable<Market[]> {
    return this._rpc.call('market', ['list']).pipe(
      retryWhen(genericPollingRetryStrategy()),
      map((marketsReq: RespMarketListMarketItem[]) => {
        const filteredMarkets: Market[] = [];
        for (const market of marketsReq) {
          if (
            (profileId ? market.profileId === profileId : true) &&
            (identityId ? market.identityId === identityId : true)
          ) {
            filteredMarkets.push({id: market.id, name: market.name, type: market.type, receiveAddress: market.receiveAddress});
          }
        }
        return filteredMarkets;
      })
    );
  }


  private parseCategories(category: RespCategoryList, marketKey: string = ''): CategoryItem {
    const item = {
      id: category.id,
      name: category.name,
      children: []
    };

    if (Object.prototype.toString.call(category.ChildItemCategories) === '[object Array]') {
      item.children = category.ChildItemCategories.reduce<CategoryItem[]>((acc: CategoryItem[], childItem: RespCategoryList) => {
        if (!marketKey || (childItem.market === marketKey)) {
          return acc.concat(this.parseCategories(childItem));
        }
        return acc;
      }, []);
    }

    return item;
  }

}
