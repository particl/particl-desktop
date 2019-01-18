import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { ListingService } from './listing.service';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/_test/core-test/market-test/market.mockservice';

describe('ListingService', () => {

  const listingId = 1;
  const pageNumber = 1;
  const pageLimit = 30;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [{
        provide: MarketService, useClass: MockMarketService
      }]
    });
  });

  it('should be created', inject([ListingService], (service: ListingService) => {
    expect(service).toBeTruthy();
  }));

  it('should get listing return data', inject([ListingService], async (service: ListingService) => {

    expect(service).toBeTruthy();
    const listing = await service.get(listingId).toPromise();
    expect(listing).not.toBe(null);
  }));

  it(
    `should get method return the current data of listing Id: ${listingId}`,
    inject([ListingService], async (service: ListingService) => {

      const listing = await service.get(listingId).toPromise();
      expect(listing).not.toBe(null);
      expect(listing['listing']['id']).not.toBe(null);
      expect(listing['listing']['id']).toBe(listingId);
    })
  );

  it(
    `should search method return the current data of listings for page: ${pageNumber}`,
    inject([ListingService], async (service: ListingService) => {
      const listings = await service.search(pageNumber, pageLimit, null, null, null, null, null ).toPromise();
      expect(listings).not.toBe(null);
      expect(listings).not.toBe(null);
      expect(listings.length).toBe(10);
    })
  );

});
