import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../market.module';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { MarketStateService } from './market-state.service';
import { CoreModule } from 'app/core/core.module';

describe('MarketStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [MarketStateService]
    });
  });

  it('should be created', inject([MarketStateService], (service: MarketStateService) => {
    expect(service).toBeTruthy();
  }));
});
