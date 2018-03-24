import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { Template } from 'app/core/market/api/template/template.model';

@Injectable()
export class TemplateService {

  constructor(
    private market: MarketService,
    private marketState: MarketStateService
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
      let params  = [
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

  addPicture(id, data) {
    return this.market.uploadImage(id, data);
  }

  search(page: number, pageLimit: number, profileId: number, category: string, searchString: string): Observable<Array<Template>> {
    let params = ['search', page, pageLimit, 'ASC', profileId, category, searchString];
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
