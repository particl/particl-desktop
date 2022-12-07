import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { retryWhen, map, mapTo, catchError } from 'rxjs/operators';

import { ParticlRpcService } from 'app/networks/networks.module';

import { FilterTransactionOptionsModel, FilteredTransaction } from './transaction-table.models';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { RPCResponses } from 'app/networks/particl/particl.models';


@Injectable()
export class TransactionService {

  constructor(
    private _rpc: ParticlRpcService
  ) { }


  getFilteredTransactions(filters: FilterTransactionOptionsModel): Observable<FilteredTransaction[]> {
    return this._rpc.call<RPCResponses.FilterTransactions.Response>('filtertransactions', [filters]).pipe(
      retryWhen (genericPollingRetryStrategy()),
      map((response) => {
        return response.map(item => new FilteredTransaction(item));
      })
    );
  }


  abandonTransaction(txid: string): Observable<boolean> {
    return this._rpc.call<RPCResponses.AbandonTransaction>('abandontransaction', [txid]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }
}
