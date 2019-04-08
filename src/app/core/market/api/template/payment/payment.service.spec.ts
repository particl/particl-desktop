import { TestBed, inject } from '@angular/core/testing';

import { PaymentService } from './payment.service';
import { MarketModule } from 'app/core/market/market.module';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { IpcService } from 'app/core/ipc/ipc.service';

describe('PaymentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MarketModule.forRoot()
      ],
      providers: [
        IpcService,
        PaymentService
      ]
    });
  });

  it('should be created', inject([PaymentService], (service: PaymentService) => {
    expect(service).toBeTruthy();
  }));
});
