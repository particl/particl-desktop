import { TestBed, inject } from '@angular/core/testing';

import { ModalsModule } from './modals.module';
import { RpcModule } from '../core/rpc/rpc.module';

import { ModalsService } from './modals.service';

describe('ModalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ModalsModule;
        RpcModule.forRoot()
      ]
    });
  });

  it('should be created', inject([ModalsService], (service: ModalsService) => {
    expect(service).toBeTruthy();
  }));
});
