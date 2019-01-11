import { TestBed, inject } from '@angular/core/testing';

import { PaymentService } from './payment.service';
import { MarketModule } from 'app/core/market/market.module';
import { PaymentMockService } from 'app/_test/core-test/market-test/template-test/payment-test/payment-mock.service';
import { updateData } from 'app/_test/core-test/market-test/template-test/payment-test/mock-data/update';

describe('PaymentService', () => {
  const templateId = 1;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [
        { provide: PaymentService, useClass: PaymentMockService }
      ]
    });
  });

  it('should be created', inject([PaymentService], (service: PaymentService) => {
    expect(service).toBeTruthy();
  }));

  it('should update method return the success response with response data', inject([PaymentService], async (service: PaymentService) => {
    expect(service).toBeTruthy();
    const response = await service.update(templateId, 10, 1 , 1).toPromise();
    expect(response).toEqual(updateData)
  }));
});
