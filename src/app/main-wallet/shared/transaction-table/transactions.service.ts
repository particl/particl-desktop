import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable, of } from 'rxjs';
import { retryWhen, map, mapTo, catchError } from 'rxjs/operators';
import { FilterTransactionOptionsModel, FilterTransactionModel, FilteredTransaction } from './transaction-table.models';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { genericPollingRetryStrategy } from 'app/core/util/utils';


@Injectable()
export class TransactionService implements OnDestroy {


  private log: any = Log.create('transaction.service id:' + Math.floor((Math.random() * 1000) + 1));


  constructor(
    private _rpc: MainRpcService
  ) {
    this.log.d('service initializing');
  }


  ngOnDestroy() {
    this.log.d('service destroyed');
  }


  getFilteredTransactions(filters: FilterTransactionOptionsModel): Observable<FilteredTransaction[]> {
    return this._rpc.call('filtertransactions', [filters]).pipe(
      retryWhen (genericPollingRetryStrategy()),
      map((response: FilterTransactionModel[]) => {
        return response.map(item => new FilteredTransaction(item));
      })
    );
  }


  abandonTransaction(txid: string): Observable<boolean> {
    return this._rpc.call('abandontransaction', [txid]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }
}
