import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../market.module';

import { MarketStateService } from './market-state.service';

describe('MarketStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [MarketStateService]
    });
  });

  it('should be created', inject([MarketStateService], (service: MarketStateService) => {
    expect(service).toBeTruthy();
  }));
});
