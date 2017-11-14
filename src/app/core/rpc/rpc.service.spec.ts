import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RpcModule } from './rpc.module';
import { RpcService } from './rpc.service';

describe('RpcService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        RpcModule.forRoot()
      ]
    });
  });

  it('should be created', inject([RpcService], (service: RpcService) => {
    expect(service).toBeTruthy();
  }));
});
