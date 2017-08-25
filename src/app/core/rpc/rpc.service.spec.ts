import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { RPCService } from './rpc.service';
import { ElectronService } from 'ngx-electron';

describe('RPCService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        RPCService,
        ElectronService
      ]
    });
  });

  it('should be created', inject([RPCService], (service: RPCService) => {
    expect(service).toBeTruthy();
    service.stopPolling();
  }));
});
