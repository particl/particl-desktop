import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

import { AddressService } from './address.service';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        RpcWithStateModule.forRoot(),
      ],
      providers: [AddressService]
    });
  });

  it('should ...', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
