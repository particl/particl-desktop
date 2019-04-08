import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';
import {
SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { BidService } from './bid.service';

describe('BidService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [BidService]
    });
  });

  it('should be created', inject([BidService], (service: BidService) => {
    expect(service).toBeTruthy();
  }));
});
