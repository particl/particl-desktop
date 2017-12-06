import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../../core/rpc/rpc.module';
import { CoreModule } from '../../../core/core.module';

import { TransactionService } from './transaction.service';


describe('TransactionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot(),
        CoreModule.forRoot()
      ],
      providers: [TransactionService]
    });
  });

  it('should ...', inject([TransactionService], (service: TransactionService) => {
    expect(service).toBeTruthy();
  }));
});
