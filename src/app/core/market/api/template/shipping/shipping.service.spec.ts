import { TestBed, inject } from '@angular/core/testing';

import { ShippingService } from './shipping.service';
import { MarketModule } from 'app/core/market/market.module';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from 'app/core/core.module';

describe('ShippingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [ShippingService]
    });
  });

  it('should be created', inject([ShippingService], (service: ShippingService) => {
    expect(service).toBeTruthy();
  }));
});
