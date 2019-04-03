import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';

import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';

import { Template } from 'app/core/market/api/template/template.model';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class TemplateService {

  constructor(
    private market: MarketService,
    public listingCache: PostListingCacheService
  ) { }

  get(templateId: number, returnImageData: boolean = false): Observable<Template> {
    return this.market.call('template', ['get', templateId, returnImageData]).pipe(map(t => new Template(t)));
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
    // TODO: Place radio buttons on gui to determine sorting action directions
      let direction;
      if (sort === 'TITLE') {
        direction = 'ASC';
      } else {
        direction = 'DESC';
      }
    const params = ['search', page, pageLimit, direction, sort,  profileId, searchString, category, hashItems];
    return this.market.call('template', params)
    .pipe(map(
      (templates: any) => {
        return templates.map(t => new Template(t));
      }
    ));
  }

  post(template: Template, marketId: number, expTime: number, estimateFee: boolean = false) {
    return this.market.call('template', ['post', template.id, expTime, marketId, estimateFee])
    .pipe(tap(t => {
      if (!estimateFee) {
        this.listingCache.posting(template)
      }
      return t;
    }));
  }

  size(listingTemplateId: number) {
    return this.market.call('template', ['size', listingTemplateId]);
  }

  remove(listingTemplateId: number) {
    return this.market.call('template', ['remove', listingTemplateId]);
  }

}
