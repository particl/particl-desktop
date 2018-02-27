import { Injectable } from '@angular/core';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

@Injectable()
export class ListingService {

  constructor(
    private market: MarketService,
    private marketState: MarketStateService
  ) { 
    this.search(1, 10).subscribe(
      (list) => {
        console.log('Listing search:');
        console.log(list);
      }
    )
  }

  search(page: number, pageLimit: number) {
    return this.market.call('item', ['search', page, pageLimit, 'ASC', 1, 'ALL', '*']);
  }

  generateListing() {
    console.log('generating listing');
    return this.market.call('data', ['generate', 'listingitem', 1, true]);
  }

}
