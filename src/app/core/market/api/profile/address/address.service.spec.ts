import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from 'app/core/market/market.module';

import { AddressService } from './address.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { IpcService } from 'app/core/ipc/ipc.service';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot(),
        SharedModule
      ],
      providers: [
        IpcService,
        AddressService
      ]
    });
  });

  it('should be created', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
