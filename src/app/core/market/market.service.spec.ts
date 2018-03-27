import { TestBed, inject } from '@angular/core/testing';

import { MarketService } from './market.service';
import { MarketModule } from './market.module';

describe('MarketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [ MarketService ]
    });
  });

  it('should be created', inject([MarketService], (service: MarketService) => {
    expect(service).toBeTruthy();
  }));
});
