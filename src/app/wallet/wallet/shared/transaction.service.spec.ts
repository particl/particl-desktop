import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcService, RpcStateService } from '../../../core/rpc/rpc.module';
import { CoreModule } from '../../../core/core.module';
import { MockRpcService } from 'app/core/rpc/rpc.mockservice';
import { TransactionService } from './transaction.service';

fdescribe('TransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot()
      ],
      providers: [
        RpcStateService,
        TransactionService,
        { provide: RpcService, useClass: MockRpcService }
      ]
    });
  });

  it('should be create', inject([TransactionService], (service: TransactionService) => {
    expect(service).toBeTruthy();
  }));

  it('should load transactions', inject([TransactionService], (service: TransactionService) => {
    service.loadTransactions();
    expect(service.txs.length).toBeGreaterThan(0);
    expect(service.loading).toBe(false);
  }));

  // it('should filter transactions', inject([TransactionService], (service: TransactionService) => {
  //   service.filter();
  //   expect(service.txs.length).toBeGreaterThan(0);
  //   expect(service.loading).toBe(false);
  // }));

});
