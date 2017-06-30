import { TestBed, inject } from '@angular/core/testing';

import { SendService } from './send.service';

import { ElectronService } from 'ngx-electron';
import { SharedModule } from '../../shared/shared.module';
import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';

describe('SendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        SendService,
        AppService,
        ElectronService,
        RPCService
      ]
    });
  });

  it('should be created', inject([SendService], (service: SendService) => {
    expect(service).toBeTruthy();
  }));
});
