import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { ModalsModule } from './modals.module';

import { ElectronService } from 'ngx-electron';
import { PeerService } from '../core/rpc/peer.service';
import { RPCService } from '../core/rpc/rpc.service';
import { StatusService } from '../core/status/status.service';

import { ModalsService } from './modals.service';

describe('ModalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        ModalsModule
      ],
      providers: [
        ElectronService,
        PeerService,
        RPCService,
        StatusService
      ]
    });
  });

  it('should be created', inject([ModalsService], (service: ModalsService) => {
    expect(service).toBeTruthy();
  }));
});
