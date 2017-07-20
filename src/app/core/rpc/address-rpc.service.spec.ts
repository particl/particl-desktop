import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule, AddressRpcService } from './rpc.module';


describe('AddressRpcService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
    });
  });

  it('should be created', inject([AddressRpcService], (service: AddressRpcService) => {
    expect(service).toBeTruthy();
  }));
});
