import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { PostListingCacheService } from 'app/core/market/market-cache/post-listing-cache.service';

import { Listing } from 'app/core/market/api/listing/listing.model';

@Injectable()
export class ListingService {
  private log: any = Log.create('listing.service id:' + Math.floor((Math.random() * 1000) + 1));
  constructor(
    private market: MarketService,
    public cache: PostListingCacheService
  ) {

  }
  search(page: number, pageLimit: number, profileId: number | string,
         search: string, catId: number, country: any, flag: boolean): Observable<Array<Listing>> {

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
      flag // withRelated
    ];

    return this.market.call('item', params)
    .map(
      (listings: Array<Listing>) => {
        console.log('listings.map(t => new Listing(t))----', listings.map(t => new Listing(t)));
        return listings.map(t => new Listing(t));
      }
    ).do(
      listings => this.log.d('Listings', listings)
    );
  }

  get(id: number) {
    return this.market.call('item', ['get', id]).map(listing => new Listing(listing));
  }

}
