import { TestBed, inject } from '@angular/core/testing';

import { RpcModule } from '../rpc/rpc.module';

import { ModalsService } from '../../modals/modals.service';
import { StatusService } from './status.service';

describe('StatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RpcModule
      ],
      providers: [
        ModalsService,
        StatusService
      ]
    });
  });

  it('should be created', inject([StatusService], (service: StatusService) => {
    expect(service).toBeTruthy();
  }));
});
