
import {throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';
import { map, catchError } from 'rxjs/operators';

import { IpcService } from '../ipc/ipc.service';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    electron: boolean;
  }
}

/**
 * The RPC service that maintains a single connection to the particld daemon.
 *
 * It has two important functions: call and register.
 */

@Injectable(
  {providedIn: 'root'}
)
export class RpcService implements OnDestroy {

  private log: any = Log.create('rpc.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;
  private isInitialized: boolean = false;
  private DAEMON_CHANNEL: string = 'rpc-configuration';

  /**
   * IP/URL for daemon (default = localhost)
   */
  private hostname: String = environment.particlHost;

  /**
   * Port number of default daemon
   */
  private port: number = environment.particlPort;

  private daemonProto: number = 0;

  // note: password basic64 equiv= dGVzdDp0ZXN0
  private authorization: string = btoa('test:test');

  constructor(
    private _http: HttpClient,
    private _ipc: IpcService
  ) {
    if (environment.isTesting || !window.electron) {
      this.isInitialized = true;
    } else {
      this._ipc.registerListener(this.DAEMON_CHANNEL, this.daemonListener.bind(this));
      this.requestConfiguration();
      this.log.d('Creating service');
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.log.d('Destroying service');
  }

  get enabled(): boolean {
    return this.isInitialized;
  }

  set daemonProtocol(protocol: number) {
    /*
      @TODO (zaSmilingIdiot 2019-05-03):
        This shouldn't be set externally, but since we are doing a connection check elsewhere,
        but need to store this on a singleton instance, this is the quickest (dirtiest) place to put this.
        Fix this!!
    */
   if (!this.daemonProto) {
    this.daemonProto = +protocol;
   }
  }

  get daemonProtocol(): number {
    return this.daemonProto;
  }

  /**
   * Set the wallet to execute commands against.
   * @param w the wallet filename .
   */
  set wallet(w: string) {
    localStorage.setItem('wallet', w);
  }

  get wallet(): string {
    return localStorage.getItem('wallet') || '';
  }

  /**
   * The call method will perform a single call to the particld daemon and perform a callback to
   * the instance through the function as defined in the params.
   *
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
  call(method: string, params?: Array<any> | null): Observable<any> {

    if (!this.isInitialized) {
      return observableThrowError('Initializing...');
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
    if (!['createwallet', 'loadwallet', 'listwalletdir',
          'listwallet', 'smsgdisable', 'smsgenable'].includes(method)) {
      url += `/wallet/${this.wallet}`
    }

    return this._http
      .post(url, postData, { headers: headers })
        .pipe(map((response: any) => response.result))
        .pipe(catchError((error => {
          let err: string;
          if (typeof error._body === 'object') {
            err =  error._body
          } else if (error._body) {
            err = JSON.parse(error._body);
          } else {
            err = error.error && error.error.error ? error.error.error : error.message;
          }
          return observableThrowError(err)
        })))
  }

  private daemonListener(config: any): Observable<any> {
    return Observable.create(observer => {
      const isValid = config.auth && (config.auth !== this.authorization);
      this.log.d(`Received RPC configuration: details are valid: ${isValid}`);
      if (isValid) {
        this.hostname = config.rpcbind || 'localhost';
        this.port = config.port ? config.port : this.port;
        this.authorization = config.auth ? config.auth : this.authorization;
        this.isInitialized = true;
      }

      // complete
      observer.complete();
    });
  }

  private requestConfiguration(): void {
    setTimeout(() => {
      this.log.d('Checking if RPC configuration is valid');
      if (!this.isInitialized) {
        this.log.d('Requesting valid RPC configuration');
        this._ipc.runCommand('request-configuration', null, null);
        this.requestConfiguration();
      }
    }, 5000);
  }

}
