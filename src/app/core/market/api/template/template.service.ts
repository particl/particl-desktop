import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';

import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';

import { Template } from 'app/core/market/api/template/template.model';
import { EscrowType } from 'app/core/market/api/template/escrow/escrow.service';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class TemplateService {

  constructor(
    private market: MarketService,
    public listingCache: PostListingCacheService
  ) { }

  get(templateId: number, returnImageData: boolean = false): Observable<Template> {
    return this.market.call('template', ['get', templateId, returnImageData]).pipe(
      map(t => this.fixMarketplaceImagePath(new Template(t)))
    );
  }

  // template add 1 "title" "short" "long" 80 "SALE" "PART" 5 5 5 "Pasdfdfd"
  add(title: string,
    shortDescr: string,
    longDescr: string,
    categoryIdOrName: number | string,
    paymentType: string, // TODO: enum
    currency: string, // TODO: enum
    basePrice: number,
    domesticShippingPrice: number,
    internationalShippingPrice: number,
    escrowType: EscrowType,
    buyerRatio: number,
    sellerRatio: number
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
        escrowType,
        +buyerRatio,
        +sellerRatio
      ];
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
        return templates.map(t => this.fixMarketplaceImagePath(new Template(t)));
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

  private fixMarketplaceImagePath(templ: Template): Template {
    //  @TODO: zaSmilingIdiot: 2019-10-22
    //  This is a sucky way of doing this. But the image datas for each image stored in the MP DB have a data_id field, which stores
    //  the entire URL to request the specific image from the marketplace. Which creates an issue if the marketplace hostname/port
    //  changes after images are stored. Using the url stated for an image would be an invalid path in such a case.
    // This bit attempts to "fix" this...
    templ.imageCollection.images.forEach(image => {
      (image.itemImageDatas || []).forEach(datas => {
        const pathparts = String(datas.dataId).split(':');
        const newPath = `http://${this.market.hostname}:${this.market.port}/${pathparts[pathparts.length - 1].split('/').slice(1).join('/')}`;
        datas.dataId = newPath;
      });
    });

    return templ;
  }

}
