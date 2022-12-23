import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { retryWhen, concatMap, catchError, map, mapTo } from 'rxjs/operators';
import { ParticlRpcService } from 'app/networks/networks.module';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { RPCResponses } from 'app/networks/particl/particl.models';


@Injectable()
export class CreateWalletService {


  constructor(
    private _rpc: ParticlRpcService
  ) { }


  createWallet(walletName: string): Observable<RPCResponses.CreateWallet> {
    return this._rpc.call<RPCResponses.CreateWallet>('createwallet', [walletName]);
  }


  encryptWallet(password: string): Observable<RPCResponses.EncryptWallet> {
    return this._rpc.call<RPCResponses.EncryptWallet>('encryptwallet', [password]);
  }


  dumpWordsList(): Observable<RPCResponses.Mnemonic.DumpWords> {
    return this._rpc.call<RPCResponses.Mnemonic.DumpWords>('mnemonic', ['dumpwords']).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 5}))
    );
  }


  generateMnemonic(): Observable<RPCResponses.Mnemonic.New> {
    return this._rpc.call<RPCResponses.Mnemonic.New>('mnemonic', ['new']).pipe(
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


  generateNewStealthAddress(): Observable<RPCResponses.GetNewStealthAddress> {
    return this._rpc.call<RPCResponses.GetNewStealthAddress>('getnewstealthaddress', ['']).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 2}))
    );
  }


  generateNewAddress(): Observable<RPCResponses.GetNewAddress> {
    return this._rpc.call<RPCResponses.GetNewAddress>('getnewaddress', ['']).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 2}))
    );
  }

  generateInitialAddressHelper(): Observable<boolean> {
    return this.generateNewStealthAddress().pipe(
      mapTo(true),
      catchError(() => of(false)),
      concatMap((stealthSuccess) => this.generateNewAddress().pipe(
        mapTo(true),
        catchError(() => of(false)),
        map((addressSuccess) => stealthSuccess && addressSuccess)
      ))
    );
  }
}
