import { TestBed, inject } from '@angular/core/testing';

import { AddressService } from './address.service';

import { ElectronService } from 'ngx-electron';
import { SharedModule } from '../../shared/shared.module';
import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        AddressService,
        AppService,
        ElectronService,
        RPCService
      ]
    });
  });

  it('should ...', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
