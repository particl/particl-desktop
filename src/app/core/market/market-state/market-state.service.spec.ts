import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../market.module';
import { HttpClientModule } from '@angular/common/http';
import { MarketStateService } from './market-state.service';
import { CoreModule } from 'app/core/core.module';

describe('MarketStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
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
