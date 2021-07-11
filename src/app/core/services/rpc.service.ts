
import {throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';
import { map, catchError} from 'rxjs/operators';

import { ConnectionDetails } from 'app/core/store/app.models';


/**
 * The RPC service that maintains a single connection to the particld daemon.
 *
 * It has two important functions: call and register.
 */

@Injectable(
  {providedIn: 'root'}
)
export class RpcService {

  private log: any = Log.create('rpc.service id:' + Math.floor((Math.random() * 1000) + 1));
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
    'tallyvotes'
  ];

  /**
   * Whether the application is ready for rpc requests to be made or not
   */
  private isConnected: boolean;

  /**
   * IP/URL for daemon (default = localhost)
   */
  private hostname: string;

  /**
   * Port number of default daemon
   */
  private port: number;

  // note: password basic64 equiv= dGVzdDp0ZXN0
  private authorization: string;

  constructor(
    private _http: HttpClient
  ) {
    this.log.d('Creating service');
  }

  setConnectionDetails(details: ConnectionDetails) {
    this.hostname = details.rpcHostname;
    this.port = details.rpcPort;
    this.authorization = details.rpcAuth;
    this.isConnected = this.hostname.length > 0 && this.authorization.length > 0;
  }

  /**
   * The call method will perform a single call to the particld daemon and perform a callback to
   * the instance through the function as defined in the params.
   *
   * @param {string} walletName  The name of the wallet to run the method against.
   * @param {string} method  The JSON-RPC method to call, see ```./particld help```
   * @param {Array<Any>} params  The parameters to pass along with the JSON-RPC request.
   * The content of the array is of type any (ints, strings, booleans etc)
   *
   * @example
   * ```JavaScript
   * this._rpc.call('listtransactions', [0, 20]).subscribe(
   *              success => ...,
   *              error => ...);
   * ```
   */
  call(walletName: string, method: string, params?: Array<any> | null): Observable<any> {

    if (!this.isConnected) {
      return observableThrowError('RPC services not connected...');
    }

    // Running in browser, delete?
    const postData = JSON.stringify({
      method: method,
      params: params,
      id: 1
    });

    const headerJson = {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + this.authorization,
      'Accept': 'application/json',
    };
    const headers = new HttpHeaders(headerJson);

    let url = `http://${this.hostname}:${this.port}`;
    if (!this.nonWalletCalls.includes(method)) {
      /* replace here is crucial for wallets in folder structures on Windows:
          - the path separator (backslash on Windows) is converted to forward slash in the url,
            so this url encodes any backslashes in the url to ensure wallet is named correctly in core
            (otherwise core deems the wallet to not exist or be loaded)
      */
      url += `/wallet/${walletName.replace(/\\/g, '%5C')}`;
    }

    return this._http
      .post(url, postData, { headers: headers })
        .pipe(map((response: any) => response.result))
        .pipe(catchError((error => {
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
