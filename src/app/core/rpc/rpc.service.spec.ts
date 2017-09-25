import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RpcModule } from './rpc.module';
import { RPCService } from './rpc.service';

describe('RPCService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        RpcModule.forRoot()
      ]
    });
  });

  it('should be created', inject([RPCService], (service: RPCService) => {
    expect(service).toBeTruthy();
  }));
});
