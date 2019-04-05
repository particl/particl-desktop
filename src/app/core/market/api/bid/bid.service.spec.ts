import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';
import { BidService } from './bid.service';

describe('BidService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [BidService]
    });
  });

  it('should be created', inject([BidService], (service: BidService) => {
    expect(service).toBeTruthy();
  }));
});
