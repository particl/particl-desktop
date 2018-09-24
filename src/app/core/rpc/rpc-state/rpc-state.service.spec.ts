import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from 'app/core/core.module';

import { RpcStateService } from './rpc-state.service';

describe('RpcStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot()
      ]
    });
  });

  it('should be created', inject([RpcStateService], (service: RpcStateService) => {
    expect(service).toBeTruthy();
  }));
});
