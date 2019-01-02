import { Injectable } from '@angular/core';

import { Transaction } from './transaction.model';
import { TransactionService } from './transaction.service';
import { filterTxs } from 'app/_test/core-test/rpc-test/mock-data/transactions.mock';
/*
    This is a fake mock service used for the TransactionService.
    The TransactionTableComponent provides its _own_ TransactionService,
    so we have to override it in all tests that use the component.
*/
@Injectable()
export class MockTransactionService extends TransactionService {
    txs: Array<any> = [];

    postConstructor(i: number) {
      const json = filterTxs
      this.txs = json.map(tx => {
        if (tx !== undefined) {
          return new Transaction(tx);
        }
      });

    }
  };
