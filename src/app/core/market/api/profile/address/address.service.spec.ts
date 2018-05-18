import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from 'app/core/market/market.module';

import { AddressService } from './address.service';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [AddressService]
    });
  });

  it('should be created', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
