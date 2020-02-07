import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs';
import { retryWhen, map } from 'rxjs/operators';
import { ListUnspentType, RpcUnspentBalanceUtxo } from './balances.models';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { genericPollingRetryStrategy } from 'app/core/util/utils';


@Injectable()
export class BalancesService implements OnDestroy {
  private log: any = Log.create('balances.service id:' + Math.floor((Math.random() * 1000) + 1));


  constructor(
    private _rpc: MainRpcService
  ) {
    this.log.d('service initializing');
  }


  ngOnDestroy() {
    this.log.d('service destroyed');
  }


  // getBalanceType(type: ListUnspentType): Observable<FilteredTransaction[]> {
  //   return this._rpc.call(type).pipe(
  //     retryWhen (genericPollingRetryStrategy()),
  //     map((response: RpcUnspentBalanceUtxo[]) => {
  //       return response.map(item => new FilteredTransaction(item));
  //     })
  //   );
  // }
}
