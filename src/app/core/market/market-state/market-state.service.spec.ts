import { TestBed, inject } from '@angular/core/testing';

import { MarketStateService } from './market-state.service';

describe('MarketStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MarketStateService]
    });
  });

  it('should be created', inject([MarketStateService], (service: MarketStateService) => {
    expect(service).toBeTruthy();
  }));
});
