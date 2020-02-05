import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable, of } from 'rxjs';
import { retryWhen, catchError, map } from 'rxjs/operators';

import { MainRpcService } from '../main-rpc/main-rpc.service';
import { RpcGetWalletInfo, RpcGetColdStakingInfo } from 'app/main/store/main.models';
import { genericPollingRetryStrategy } from 'app/core/util/utils';


@Injectable()
export class WalletInfoService {

  private log: any = Log.create('wallet-info-service.service id:' + Math.floor((Math.random() * 1000) + 1));

  constructor(
    private _rpc: MainRpcService
  ) {
    this.log.d('starting service...');
  }


  getWalletInfo(retryAttempts: number = 3): Observable<RpcGetWalletInfo> {
    return this._rpc.call('getwalletinfo').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: retryAttempts})),
      catchError(error => of({}))
    )
  }


  lockWallet(retryAttempts: number = 3): Observable<boolean> {
    return this._rpc.call('walletlock').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: retryAttempts})),
      catchError(error => of(false)),
      map((result) => {
        if (typeof result === 'boolean') {
          return result;
        }
        return true;
      })
    )
  }


  encryptWallet(password: string): Observable<any> {
    return this._rpc.call('encryptwallet', [password]);
  }


  walletPassphrase(password: string, timeout: number, staking: boolean = false): Observable<any> {
    return this._rpc.call('walletpassphrase', [password, (staking ? 0 : timeout), staking]);
  }


  getColdStakingInfo(retryAttempts: number = 3): Observable<RpcGetColdStakingInfo> {
    // console.log('@@@@ ASKED TO GET COLD STAKING INFO');
    return this._rpc.call('getcoldstakinginfo').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: retryAttempts})),
      catchError(error => of({}))
    )
  }

}
