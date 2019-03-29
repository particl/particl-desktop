import { Injectable } from '@angular/core';

import { Transaction } from './transaction.model';
import { TransactionService } from './transaction.service';
import { Result } from 'app/core/rpc/rpc.responses';
/*
    This is a fake mock service used for the TransactionService.
    The TransactionTableComponent provides its _own_ TransactionService,
    so we have to override it in all tests that use the component.
*/
@Injectable()
export class MockTransactionService extends TransactionService {
    txs: Array<any> = [];

    postConstructor(i: number) {
      const json = Result['filtertransactions']
      this.txs = json.map(tx => {
        if (tx !== undefined) {
          return new Transaction(tx);
        }
      });

    }
  };
