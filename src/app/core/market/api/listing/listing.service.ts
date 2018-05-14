import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';
import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';

import { Listing } from 'app/core/market/api/listing/listing.model';

@Injectable()
export class ListingService {

  constructor(
    private market: MarketService,
    public cache: PostListingCacheService
  ) {

  }
  search(page: number, pageLimit: number, profileId: number | string,
         search: string, catId: number, country: any): Observable<Array<Listing>> {

    const params = [
      'search',
      page,
      pageLimit,
      'DESC',
      catId || null, // category
      'ALL',
      profileId || 'ALL',
      null, // minPrice
      null, // maxPrice
      country ? country.toUpperCase() : null, // country
      null, // shippingDestination
      search || null, // search
      true // withRelated
    ];

    return this.market.call('item', params)
    .map(
      (listings: Array<Listing>) => {
        return listings.map(t => new Listing(t));
      }
    ).do(
      listings => console.log(listings)
    );
  }

  searchOwn(page: number, pageLimit: number) {
    return this.search(page, pageLimit, '*', null, null, null); // OWN
  }

  get(id: number) {
    return this.market.call('item', ['get', id]).map(listing => new Listing(listing));
  }

}
