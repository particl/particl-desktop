import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from 'app/core/market/market.module';

import { AddressService } from './address.service';
import { CoreModule } from 'app/core/core.module';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [AddressService]
    });
  });

  it('should be created', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
