import { Injectable } from '@angular/core';

import { MarketService } from 'app/core/market/market.service';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Observable } from 'rxjs';

@Injectable()
export class ListingService {
  public static currencyPrice: number = 0;
  constructor(
    private market: MarketService
  ) {

  }
  search(page: number, pageLimit: number, profileId: number | string,
         search: string, catId: number, country: any): Observable<Array<Listing>> {

    const params = [
      'search',
      page,
      pageLimit,
      'ASC',
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

  generateBogusListings(amount: number) {
    console.log('generating listing');
    return this.market.call('data', ['generate', 'listingitem', amount, true]).subscribe(
      (listings) => console.log('generated')
    );
  }

}
