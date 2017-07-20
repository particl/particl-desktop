import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { AddressService } from './address.service';
import { ElectronService } from 'ngx-electron';
import { AddressRpcService } from '../../core/rpc/address-rpc.service';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        AddressService,
        ElectronService,
        AddressRpcService
      ]
    });
  });

  it('should ...', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
