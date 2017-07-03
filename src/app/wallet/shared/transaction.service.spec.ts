import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { TransactionService } from './transaction.service';

import { ElectronService } from 'ngx-electron';
import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';

describe('TransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
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
