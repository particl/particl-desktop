import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable, of } from 'rxjs';
import { retryWhen, concatMap, catchError, map } from 'rxjs/operators';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { RpcMnemonicNew, RpcMnemonicDumpWords } from './create-wallet.models';


@Injectable()
export class CreateWalletService implements OnDestroy {


  private log: any = Log.create('create-wallet.service id:' + Math.floor((Math.random() * 1000) + 1));


  constructor(
    private _rpc: MainRpcService
  ) {
    this.log.d('service initializing');
  }


  ngOnDestroy() {
    this.log.d('service destroyed');
  }


  createWallet(walletName: string): Observable<any> {
    return this._rpc.call('createwallet', [walletName]);
  }


  encryptWallet(password: string): Observable<any> {
    return this._rpc.call('encryptwallet', [password]);
  }


  dumpWordsList(): Observable<RpcMnemonicDumpWords> {
    return this._rpc.call('mnemonic', ['dumpwords']).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 5}))
    );
  }


  generateMnemonic(): Observable<RpcMnemonicNew> {
    return this._rpc.call('mnemonic', ['new']).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 5})),
    );
  }


  importExtKeyGenesis(words: string[], password: string, doScan: boolean): Observable<any> {
    const params: (string | boolean | number)[] = [
      words.join(' '),
      password.length ? password : '',
      false,              // save_bip44_root
      'Master Key',       // master_label
      'Default Account'   // account_label
    ];

    if (!doScan) {
      params.push(-1);  // scan_chain_from  (negative num to prevent scanning)
    }

    return this._rpc.call('extkeygenesisimport', params);
  }


  generateNewStealthAddress(): Observable<any> {
    return this._rpc.call('getnewstealthaddress', ['']).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 2}))
    );
  }


  generateNewAddress(): Observable<any> {
    return this._rpc.call('getnewaddress', ['']).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 2}))
    );
  }

  generateInitialAddressHelper(): Observable<boolean> {
    return this.generateNewStealthAddress().pipe(
      catchError(() => of(false)),
      concatMap((stealthSuccess) => {
        return this.generateNewAddress().pipe(
          catchError(() => of(false)),
          map((addressSuccess) => {
          return stealthSuccess && addressSuccess;
        }));
      })
    );
  }
}
