import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ElectronService } from 'ngx-electron';

import { ModalsService } from '../../modals/modals.service';
import { RPCService } from '../../core/rpc/rpc.service';
import { PeerService } from '../../core/rpc/peer.service';

import { StatusService } from './status.service';

describe('StatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      providers: [
        ElectronService,
        ModalsService,
        RPCService,
        PeerService,
        StatusService
      ]
    });
  });

  it('should be created', inject([StatusService], (service: StatusService) => {
    expect(service).toBeTruthy();
  }));
});
