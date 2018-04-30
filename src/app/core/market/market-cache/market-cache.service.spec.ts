import { TestBed, inject } from '@angular/core/testing';

import { MarketCacheService } from './market-cache.service';

describe('MarketCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarketCacheService]
    });
  });

  it('should be created', inject([MarketCacheService], (service: MarketCacheService) => {
    expect(service).toBeTruthy();
  }));
});
