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
    return this.market.call('template', ['get', templateId]).map(t => new Template(t));
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
      return this.market.call('template', params);
  }

  search(page: number, pageLimit: number, sort: string, profileId: number, category: string,
    searchString: string, hashItems: any): Observable<Array<Template>> {
    const params = ['search', page, pageLimit, 'DESC', sort,  profileId, searchString, category, hashItems];
    return this.market.call('template', params)
    .map(
      (templates: any) => {
        return templates.map(t => new Template(t));
      }
    );
  }

  post(template: Template, marketId: number, expTime: number) {
    return this.market.call('template', ['post', template.id, expTime, marketId])
    .do(t => this.listingCache.posting(template));
  }

  size(listingTemplateId: number) {
    return this.market.call('template', ['size', listingTemplateId]);
  }

  remove(listingTemplateId: number) {
    return this.market.call('template', ['remove', listingTemplateId]);
  }

  featured(listingTemplateId: number, imageID: number): Observable<void> {
    return this.market.call('image', ['featured', listingTemplateId, imageID]);
  }

}
