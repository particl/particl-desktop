import { TestBed, inject } from '@angular/core/testing';

import { MarketService } from './market.service';
import { MarketModule } from './market.module';
import { CoreModule } from '../core.module';

describe('MarketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [ MarketService ]
    });
  });

  it('should be created', inject([MarketService], (service: MarketService) => {
    expect(service).toBeTruthy();
  }));
});
