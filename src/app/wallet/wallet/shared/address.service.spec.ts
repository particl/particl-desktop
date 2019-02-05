import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

import { RpcService } from 'app/core/rpc/rpc.service';
import { AddressService } from './address.service';
import { RpcMockService } from 'app/_test/core-test/rpc-test/rpc-mock.service';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        SharedModule
      ],
      providers: [
      AddressService,
      { provide: RpcService, useClass: RpcMockService }
      ]
    });
  });

  it('should create service.', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
    service._addresses.subscribe(addresses => {
      expect(addresses.length).toBeGreaterThan(0);
    })
  }));

});
