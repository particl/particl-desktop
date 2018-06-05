import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';

import { Template } from 'app/core/market/api/template/template.model';

@Injectable()
export class TemplateService {

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    public listingCache: PostListingCacheService
  ) { }

  get(templateId: number): Observable<Template> {
    return this.market.call('template', ['get', templateId]).map(t => new Template(t))
    .do((data) => console.log('get template', data));
  }

  // template add 1 "title" "short" "long" 80 "SALE" "PARTICL" 5 5 5 "Pasdfdfd"
  add(title: string,
    shortDescr: string,
    longDescr: string,
    categoryIdOrName: number | string,
    paymentType: string, // TODO: enum
    currency: string, // TODO: enum
    basePrice: number,
    domesticShippingPrice: number,
    internationalShippingPrice: number,
    paymentAddress?: string // TODO: class
    ) {
      const params  = [
        'add',
        1, // profile
        title,
        shortDescr,
        longDescr,
        categoryIdOrName,
        paymentType,
        currency,
        basePrice,
        domesticShippingPrice,
        internationalShippingPrice,
        paymentAddress
      ];
      if (paymentAddress === undefined) {
        params.pop();
      }
      return this.market.call('template', params)
      .do((data) => console.log('add template', data));
  }

  search(page: number, pageLimit: number, profileId: number, category: string, searchString: string): Observable<Array<Template>> {
    const params = ['search', page, pageLimit, 'ASC', profileId, category, searchString];
    return this.market.call('template', params)
    .do((data) => console.log('search template', data))
    .map(
      (templates: any) => {
        return templates.map(t => new Template(t));
      }
    );
  }

  post(template: Template, marketId: number) {
    return this.market.call('template', ['post', template.id, marketId])
    .do(t => {
      console.log('post template', t);
      this.listingCache.posting(template)
    });
  }

  remove(listingTemplateId: number) {
    return this.market.call('template', ['remove', listingTemplateId])
    .do((data) => console.log('remove template', data));
  }

}
