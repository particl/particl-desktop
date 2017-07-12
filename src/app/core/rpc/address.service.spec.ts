import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule, AddressService } from './rpc.module';


describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
    });
  });

  it('should be created', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
