import { TestBed, inject } from '@angular/core/testing';

import { PaymentService } from './payment.service';
import { MarketModule } from 'app/core/market/market.module';
import { CoreModule } from 'app/core/core.module';

describe('PaymentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [PaymentService]
    });
  });

  it('should be created', inject([PaymentService], (service: PaymentService) => {
    expect(service).toBeTruthy();
  }));
});
