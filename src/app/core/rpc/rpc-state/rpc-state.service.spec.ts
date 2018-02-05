import { TestBed, inject } from '@angular/core/testing';

import { RpcStateService } from './rpc-state.service';

describe('RpcStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RpcStateService]
    });
  });

  it('should be created', inject([RpcStateService], (service: RpcStateService) => {
    expect(service).toBeTruthy();
  }));
});
