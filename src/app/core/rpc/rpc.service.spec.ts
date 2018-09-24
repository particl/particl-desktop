import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { CoreModule } from '../core.module';
import { RpcService } from './rpc.service';

describe('RpcService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        HttpClientModule
      ],
      providers: [
      // IpcService
    ]
    });
  });

  it('should be created', inject([RpcService], (service: RpcService) => {
    expect(service).toBeTruthy();
  }));
});
