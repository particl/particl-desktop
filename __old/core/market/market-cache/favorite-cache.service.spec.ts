import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from 'app/core/market/market.module';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { MarketCacheModule } from 'app/core/market/market-cache/market-cache.module';

import { FavoriteCacheService } from './favorite-cache.service';



describe('FavoriteCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot(),
        MarketCacheModule.forRoot()
      ],
      providers: [FavoriteCacheService]
    });
  });

  it('should be created', inject([FavoriteCacheService], (service: FavoriteCacheService) => {
    expect(service).toBeTruthy();
  }));
});
