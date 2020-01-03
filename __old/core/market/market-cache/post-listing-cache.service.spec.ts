import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from 'app/core/market/market.module';
import { MarketCacheModule } from 'app/core/market/market-cache/market-cache.module';

import { PostListingCacheService } from './post-listing-cache.service';

describe('PostListingCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot(),
        MarketCacheModule.forRoot()
      ],
      providers: [PostListingCacheService]
    });
  });

  it('should be created', inject([PostListingCacheService], (service: PostListingCacheService) => {
    expect(service).toBeTruthy();
  }));
});
