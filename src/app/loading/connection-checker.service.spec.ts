import { TestBed, inject } from '@angular/core/testing';

import { RpcModule } from '../core/rpc/rpc.module';

import { ConnectionCheckerService } from './connection-checker.service';


describe('ConnectionCheckerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RpcModule.forTest(),
      ],
      providers: [ConnectionCheckerService]
    });
  });

  it('should be created', inject([ConnectionCheckerService], (service: ConnectionCheckerService) => {
    expect(service).toBeTruthy();
  }));
});
