import { TestBed, inject } from '@angular/core/testing';

import { RpcModule } from '../rpc.module';
import { SharedModule } from '../../../wallet/shared/shared.module';

import { BlockStatusService } from './blockstatus.service';
import { IpcService } from '../../ipc/ipc.service';

describe('BlockStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
      providers: [
        IpcService
      ]
    });
  });

  it('should be created', inject([BlockStatusService], (service: BlockStatusService) => {
    expect(service).toBeTruthy();
  }));
});
