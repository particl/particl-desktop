import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcStateService } from '../../../core/rpc/rpc.module';
import { RpcService } from '../../../core/rpc/rpc.service';
import { CoreModule } from '../../../core/core.module';
import { MockRpcService } from 'app/core/rpc/rpc.mockservice';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
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

  it('should filter transactions of public', inject([TransactionService], (service: TransactionService) => {
    const mockFilter = {category: 'all', type: 'standard', sort: 'time', search: ''}
    service.filter(mockFilter);
    expect(service.txs.length).toEqual(10);
  }));

  it('should change page', inject([TransactionService], (service: TransactionService) => {
    const mockPage = 1;
    service.changePage(mockPage);
    expect(service.txs.length).toEqual(10);
  }));

  it('should not change page ', inject([TransactionService], (service: TransactionService) => {
    const mockPage = -1;
    expect(service.changePage(mockPage)).toBe(undefined);
  }));


});
