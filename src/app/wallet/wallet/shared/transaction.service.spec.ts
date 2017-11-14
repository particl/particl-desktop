import { TestBed, inject } from '@angular/core/testing';

import { RpcModule } from '../../core/rpc/rpc.module';
import { SharedModule } from '../../shared/shared.module';

import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
      providers: [TransactionService]
    });
  });

  it('should ...', inject([TransactionService], (service: TransactionService) => {
    expect(service).toBeTruthy();
  }));
});
