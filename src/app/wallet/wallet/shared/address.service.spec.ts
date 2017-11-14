import { TestBed, inject } from '@angular/core/testing';

import { RpcModule } from '../../core/rpc/rpc.module';
import { SharedModule } from '../../shared/shared.module';

import { AddressService } from './address.service';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
      providers: [AddressService]
    });
  });

  it('should ...', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
