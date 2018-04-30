import { TestBed, inject } from '@angular/core/testing';

import { MarketUiCacheService } from './market-ui-cache.service';

describe('MarketUiCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarketUiCacheService]
    });
  });

  it('should be created', inject([MarketUiCacheService], (service: MarketUiCacheService) => {
    expect(service).toBeTruthy();
  }));
});
