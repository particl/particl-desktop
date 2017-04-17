import { TestBed, inject } from '@angular/core/testing';

import { RpcService } from './rpc.service';

describe('RpcService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RpcService]
    });
  });

  it('should ...', inject([RpcService], (service: RpcService) => {
    expect(service).toBeTruthy();
  }));
});
