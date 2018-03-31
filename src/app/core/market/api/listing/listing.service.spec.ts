import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { ListingService } from './listing.service';

describe('ListingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [ListingService]
    });
  });

  it('should be created', inject([ListingService], (service: ListingService) => {
    expect(service).toBeTruthy();
  }));
});
