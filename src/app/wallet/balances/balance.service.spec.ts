import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../core/rpc/rpc.module';

import { BalanceService } from './balance.service';

import { Balances } from './balances.model';


describe('BalanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
      providers: [
        BalanceService,
        ElectronService,
        RPCService
      ]
    });
  });

  it('should ...', inject([BalanceService], (service: BalanceService) => {
    expect(service).toBeTruthy();
  }));
});
