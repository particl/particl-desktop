import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable, of } from 'rxjs';
import { retryWhen, catchError } from 'rxjs/operators';

import { MainRpcService } from '../main-rpc/main-rpc.service';
import { WalletInfoStateModel } from 'app/main/store/main.models';
import { genericPollingRetryStrategy } from 'app/core/util/utils';


@Injectable()
export class WalletInfoService {

  private log: any = Log.create('wallet-info-service.service id:' + Math.floor((Math.random() * 1000) + 1));

  constructor(
    private _rpc: MainRpcService
  ) {
    this.log.d('starting service...');
  }


  getWalletInfo(retryAttempts: number = 3): Observable<WalletInfoStateModel> {
    return this._rpc.call('getwalletinfo').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: retryAttempts})),
      catchError(error => of({}))
    )
  }

}
