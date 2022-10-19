import {OnDestroy, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store } from '@ngxs/store';

import {throwError as observableThrowError, Observable, Subject, merge } from 'rxjs';
import { tap, map, takeUntil, catchError, distinctUntilKeyChanged, filter} from 'rxjs/operators';

import { ParticlCoreStateModel, RunningStatus } from './particl.models';
import { NETWORK_PARTICL_STATE_TOKEN, NETWORK_PARTICL_WALLET_TOKEN } from '../networks.tokens';


/**
 * The RPC service that maintains a single connection to the particld daemon.
 */

@Injectable(
  // {providedIn: 'root'}
)
export class RpcService implements OnDestroy {

  private destroy$: Subject<void> = new Subject();

  private nonWalletCalls: string[] = [
    'createwallet',
    'loadwallet',
    'listwalletdir',
    'listwallets',
    'smsgdisable',
    'smsgenable',
    'smsgsetwallet',
    'unloadwallet',
    'getzmqnotifications',
    'getblockchaininfo',
    'getpeerinfo',
    'getnetworkinfo',
    'getblockcount',
    'tallyvotes',
  ];

  /**
   * IP/URL for daemon (default = localhost) + port number
   */
  private hostname: string;

  // note: password base64 equiv= dGVzdDp0ZXN0
  private authorization: string;

  private activeWallet: string = undefined;
  private isConnected: boolean = false;


  constructor(
    private _http: HttpClient,
    private _store: Store
  ) {
    const activeWallet$ = this._store.select(NETWORK_PARTICL_WALLET_TOKEN).pipe(
      filter(state => state !== undefined),
      distinctUntilKeyChanged('walletname'),
      map(state => state.walletname),
      tap(wallet => {
        if (typeof wallet === 'string') {
          this.activeWallet = wallet;
        }
      }),
      takeUntil(this.destroy$)
    );

    const status$ = this._store.select(NETWORK_PARTICL_STATE_TOKEN).pipe(
      filter(state => state !== undefined),
      distinctUntilKeyChanged('running'),
      tap((details: ParticlCoreStateModel) => {
        if (details.running === RunningStatus.STARTED) {
          this.hostname = details.url;
          this.authorization = details.auth;
          this.isConnected = true;
        } else if (details.running === RunningStatus.STOPPING || details.running === RunningStatus.STOPPED) {
          this.hostname = '';
          this.authorization = '';
          this.isConnected = false;
        }
      }),
      takeUntil(this.destroy$)
    );

    merge(
      activeWallet$,
      status$,
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * The call method will perform a single call to the particld daemon and perform a callback to
   * the instance through the function as defined in the params.
   *
   *
   * @param {string} method  The JSON-RPC method to call, see ```./particld help```
   * @param {Array<Any>} params  The parameters to pass along with the JSON-RPC request.
   * @param {string} wallet  The name of the wallet to run the method against.
   *
   * The content of the array is of type any (ints, strings, booleans etc)
   *
   * @example
   * ```JavaScript
   * this._rpc.call('listtransactions', [0, 20]).subscribe(
   *              success => ...,
   *              error => ...);
   * ```
   */
  call<R = any, P = any>(method: string, params?: P | null, wallet: string | null = null): Observable<R> {
    if (!this.isConnected) {
      return observableThrowError('RPC services not connected...');
    }

    const postData = JSON.stringify({
      method: method,
      params: params,
      id: 1
    });

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${this.authorization}`,
      'Accept': 'application/json',
    };

    let url = this.hostname;

    if (!this.nonWalletCalls.includes(method)) {

      const walletName = (typeof wallet === 'string') ? wallet : this.activeWallet;

      if(typeof walletName === 'string') {
        /* replace here is crucial for wallets in folder structures on Windows:
            - the path separator (backslash on Windows) is converted to forward slash in the url,
              so this url encodes any backslashes in the url to ensure wallet is named correctly in core
              (otherwise core deems the wallet to not exist or be loaded)
        */
        url += `/wallet/${walletName.replace(/\\/g, '%5C')}`;
      }
    }
    return this._http
      .post<R>(url, postData, { headers: headers })
        .pipe(map((response: any) => response.result))
        .pipe(catchError((error => {
          console.log('caught error: ', error);
          let err: string;
          if (typeof error._body === 'object') {
            err =  error._body;
          } else if (error._body) {
            err = JSON.parse(error._body);
          } else {
            err = error.error && error.error.error ? error.error.error : error.message;
          }
          return observableThrowError(err);
        })));
  }
}
