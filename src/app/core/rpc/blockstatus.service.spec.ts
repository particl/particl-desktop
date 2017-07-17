import { TestBed, inject } from '@angular/core/testing';

import { RpcModule } from './rpc.module';
import { SharedModule } from '../../shared/shared.module';

import { ModalsService } from '../../modals/modals.service';
import { BlockStatusService } from './blockstatus.service';

describe('BlockStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
      providers: [
        ModalsService,
        BlockStatusService
      ]
    });
  });

  it('should be created', inject([BlockStatusService], (service: BlockStatusService) => {
    expect(service).toBeTruthy();
  }));
});
