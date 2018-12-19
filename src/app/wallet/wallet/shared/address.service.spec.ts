import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

import { RpcService } from 'app/core/rpc/rpc.service';
import { AddressService } from './address.service';
import { MockRpcService } from 'app/core/rpc/rpc.mockservice';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        SharedModule
      ],
      providers: [
      AddressService,
      { provide: RpcService, useClass: MockRpcService }
      ]
    });
  });

  it('should create service.', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
    service._addresses.subscribe(addresses => {
      expect(addresses.length).toBeGreaterThan(0);
    })
  }));

  it('should get params when it is send.', inject([AddressService], (service: AddressService) => {
    service.typeOfAddresses = 'send'
    expect(service.rpc_getParams()[4]).toEqual('2');
  }));

  it('should get params when it is receive.', inject([AddressService], (service: AddressService) => {
    service.typeOfAddresses = 'receive'
    expect(service.rpc_getParams()[4]).toEqual('1');
  }));

  it('should get params when it is empty.', inject([AddressService], (service: AddressService) => {
    service.typeOfAddresses = ''
    expect(service.rpc_getParams()[4]).toBe(undefined);
  }));

});
