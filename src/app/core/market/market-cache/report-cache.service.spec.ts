import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from 'app/core/market/market.module';
import { MarketCacheModule } from 'app/core/market/market-cache/market-cache.module';

import { ReportCacheService } from './favorite-cache.service';



describe('ReportCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot(),
        MarketCacheModule.forRoot()
      ],
      providers: [ReportCacheService]
    });
  });

  it('should be created', inject([ReportCacheService], (service: ReportCacheService) => {
    expect(service).toBeTruthy();
  }));
});
