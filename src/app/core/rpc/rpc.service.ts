import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

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

@Injectable()
export class RpcService implements OnDestroy {

  private log: any = Log.create('rpc.service');
  private destroyed: boolean = false;
  private isInitialized: boolean = false;
  private DAEMON_CHANNEL: string = 'rpc-configuration';

  /**
   * IP/URL for daemon (default = localhost)
   */
  private hostname: String = environment.particlHost;

  /**
   * Port number of of daemon (default = 51935)
   */
  private port: number = environment.particlPort;

  // note: password basic64 equiv= dGVzdDp0ZXN0
  private authorization: string = btoa('test:test');

  public isElectron: boolean = false;

  constructor(
    private _http: HttpClient,
    private _ipc: IpcService
  ) {
    this.isElectron = false;  // window.electron
    this._ipc.registerListener(this.DAEMON_CHANNEL, this.daemonListener.bind(this));
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  get enabled(): boolean {
    return this.isInitialized;
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
      return Observable.throw('Initializing...');
    }

    if (this.isElectron) {
      return this._ipc.runCommand('rpc-channel', null, method, params).pipe(
        map(response => response && (response.result !== undefined)
                      ? response.result
                      : response
        )
      );
    } else {
      // Running in browser, delete?
      const postData = JSON.stringify({
        method: method,
        params: params,
        id: 1
      });

      const headerJson = {
       'Content-Type': 'application/json',
       //  'Authorization': 'Basic ' + this.authorization,
       'Accept': 'application/json',
      };
      const headers = new HttpHeaders(headerJson);

      return this._http
        .post(`http://${this.hostname}:${this.port}`, postData, { headers: headers })
          .map((response: any) => response.result)
          .catch(error => {
            let err: string;
            if (typeof error._body === 'object') {
              err =  error._body
            } else if (error._body) {
              err = JSON.parse(error._body);
            } else {
              err = error.error && error.error.error ? error.error.error : error.message;
            }

            return Observable.throw(err)
          })
    }
  }

  private daemonListener(config: any): Observable<any> {
    return Observable.create(observer => {
      if (config.auth && (config.auth !== this.authorization)) {
        this.hostname = config.rpcbind || 'localhost';
        this.port = config.port ? config.port : this.port;
        this.authorization = config.auth ? config.auth : this.authorization;
        this.isInitialized = true;
      }

      // complete
      observer.complete();
    });
  }

}
