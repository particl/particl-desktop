import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { RpcModule } from './rpc.module';
import { RpcService } from './rpc.service';
import { IpcService } from '../ipc/ipc.service';

describe('RpcService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RpcModule.forRoot(),
        HttpClientModule
      ],
      providers: [
      IpcService
    ]
    });
  });

  it('should be created', inject([RpcService], (service: RpcService) => {
    expect(service).toBeTruthy();
  }));
});
