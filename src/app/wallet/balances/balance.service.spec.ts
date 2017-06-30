import { TestBed, inject } from '@angular/core/testing';

import { ElectronService } from 'ngx-electron';

import { BalanceService } from './balance.service';

import { SharedModule } from '../../shared/shared.module';

import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';

describe('BalanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        BalanceService,
        AppService,
        ElectronService,
        RPCService
      ]
    });
  });

  it('should ...', inject([BalanceService], (service: BalanceService) => {
    expect(service).toBeTruthy();
  }));
});
