import { TestBed, inject } from '@angular/core/testing';
import { SharedModule } from '../../shared/shared.module';

import { TransactionService } from './transaction.service';

import { ElectronService } from 'ngx-electron';
import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';

describe('TransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        TransactionService,
        AppService,
        ElectronService,
        RPCService
      ]
    });
  });

  it('should ...', inject([TransactionService], (service: TransactionService) => {
    expect(service).toBeTruthy();
  }));
});
