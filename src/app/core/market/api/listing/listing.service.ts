import { Injectable } from '@angular/core';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

@Injectable()
export class ListingService {

  constructor(
    private market: MarketService,
    private marketState: MarketStateService
  ) {

  }
  search(page: number, pageLimit: number, profileId: number | string, search: string, catId: number, country: any) {

    const params = [
      'search',
      page,
      pageLimit,
      'ASC',
      catId || null, // category
      'ALL', 
      profileId || "ALL",
      null, // minPrice
      null, // maxPrice
      country ? country.toUpperCase() : null, // country
      null, // shippingDestination
      search || null, // search
      true // withRelated
    ];

    return this.market.call('item', params);
  }

  searchOwn(page: number, pageLimit: number) {
    return this.search(page, pageLimit, "*", null, null, null); // OWN
  }

  get(id) {
    return this.market.call('item', ['get', id]);
  }

  generateBogusListings(amount: number) {
    console.log('generating listing');
    return this.market.call('data', ['generate', 'listingitem', amount, true]).subscribe(
      (listings) => console.log('generated')
    );
  }

}
