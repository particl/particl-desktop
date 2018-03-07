import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';

import { Template } from 'app/core/market/api/template/template.model';

@Injectable()
export class TemplateService {

  constructor(
    private market: MarketService
  ) { }

  get(templateId: number) {
    return this.market.call('template', ['get', templateId]);
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

  // @TODO remove type any
  addPicture(id: number, data: any) {
    const params = [
      'image', 'add',
      id,
      'LOCAL',
      'BASE64',
      data
    ];
    return this.market.call('template', params);
  }

  search(page: number, pageLimit: number, profileId: number, category: string, searchString: string): Observable<Array<Template>> {
    const params = ['search', page, pageLimit, 'ASC', profileId, category, searchString];
    return this.market.call('template', params)
      .map(
        (templates: any) => {
          return templates.map(t => new Template(t));
        }
      );
  }

  post(listingTemplateId: number, marketId: number) {
    return this.market.call('template', ['post', listingTemplateId, marketId]);
  }

  remove(listingTemplateId: number) {
    return this.market.call('template', ['remove', listingTemplateId]);
  }

}
