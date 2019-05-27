import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from 'app/wallet/shared/shared.module';
import { MarketModule } from 'app/core/market/market.module';
import { MarketCacheModule } from 'app/core/market/market-cache/market-cache.module';
import { CoreModule } from 'app/core/core.module';
import { AddToCartCacheService } from './add-to-cart-cache.service';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('AddToCartCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot(),
        MarketCacheModule.forRoot(),
        RpcWithStateModule.forRoot()
      ],
      providers: [AddToCartCacheService]
    });
  });

  it('should be created', inject([AddToCartCacheService], (service: AddToCartCacheService) => {
    expect(service).toBeTruthy();
  }));
});
