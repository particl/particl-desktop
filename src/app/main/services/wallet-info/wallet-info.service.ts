import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable, of, forkJoin } from 'rxjs';
import { retryWhen, catchError, map, mapTo } from 'rxjs/operators';

import { MainRpcService } from '../main-rpc/main-rpc.service';
import { RpcGetWalletInfo, RpcGetColdStakingInfo, PublicUTXO, BlindUTXO, AnonUTXO } from 'app/main/store/main.models';
import { genericPollingRetryStrategy } from 'app/core/util/utils';


interface IWalletModel {
  name: string;
}

interface IWalletCollectionModel {
  wallets: IWalletModel[];
}


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
    );
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
    );
  }


  encryptWallet(password: string): Observable<any> {
    return this._rpc.call('encryptwallet', [password]);
  }


  walletPassphrase(password: string, timeout: number, staking: boolean = false): Observable<any> {
    return this._rpc.call('walletpassphrase', [password, (staking ? 0 : timeout), staking]);
  }


  getColdStakingInfo(retryAttempts: number = 3): Observable<RpcGetColdStakingInfo> {
    return this._rpc.call('getcoldstakinginfo').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: retryAttempts})),
      catchError(error => of({}))
    );
  }


  getWalletList(): Observable<IWalletCollectionModel> {
    return this._rpc.call('listwalletdir').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 2}))
    );
  }


  getAllUTXOs(): Observable<{public: PublicUTXO[], blind: BlindUTXO[], anon: AnonUTXO[]}> {
    const public$: Observable<PublicUTXO[]> = this._rpc.call('listunspent').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 1})),
      catchError(() => of([]))
    );
    const blind$: Observable<BlindUTXO[]> = this._rpc.call('listunspentblind').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 1})),
      catchError(() => of([]))
    );
    const anon$: Observable<AnonUTXO[]> = this._rpc.call('listunspentanon').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 1})),
      catchError(() => of([]))
    );

    return forkJoin(
      {
        public: public$,
        blind: blind$,
        anon: anon$
      }
    );
  }


  setSmsgActiveWallet(name: string): Observable<boolean> {
    const params = [];
    if (typeof name === 'string') {
      params.push(name);
    }
    return this._rpc.call('smsgsetwallet', params).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }

}