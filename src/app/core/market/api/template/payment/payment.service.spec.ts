import { TestBed, inject } from '@angular/core/testing';

import { PaymentService } from './payment.service';
import { MarketModule } from 'app/core/market/market.module';
import { paymentUpdate } from 'app/_test/core-test/market-test/template-test/payment-test/mock-data/update';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/_test/core-test/market-test/market.mockservice';

describe('PaymentService', () => {
  const templateId = 1;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [
        { provide: MarketService, useClass: MockMarketService }
      ]
    });
  });

  it('should be created', inject([PaymentService], (service: PaymentService) => {
    expect(service).toBeTruthy();
  }));

  it('should update method return the success response with response data', inject([PaymentService], async (service: PaymentService) => {
    expect(service).toBeTruthy();
    const response = await service.update(templateId, 10, 1 , 1).toPromise();
    expect(response).toEqual(paymentUpdate)
  }));
});
