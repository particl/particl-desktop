import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from 'app/core/core.module';

import { RpcStateService } from './rpc-state.service';
import { RpcWithStateModule } from '../rpc.module';

describe('RpcStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RpcWithStateModule.forRoot(),
        CoreModule.forRoot()
      ]
    });
  });

  it('should be created', inject([RpcStateService], (service: RpcStateService) => {
    expect(service).toBeTruthy();
  }));
});
