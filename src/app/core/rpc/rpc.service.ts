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
  private isInitialized = false;

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
    this.requestConfiguration();
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

      console.log('@@@ REQUEST TO: ', `http://${this.hostname}:${this.port}`, '<<<');


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

  private async requestConfiguration(): Promise<void> {
    await this._ipc.runCommand('rpc-configuration', null).toPromise().then(resp => {
      console.log('@@@@ RECIVED CONFIG: ', resp);
      this.hostname = resp.rpcbind || 'localhost';
      this.port = resp.port ? resp.port : this.port;
      this.authorization = resp.auth ? resp.auth : this.authorization;
      this.isInitialized = true;
    }).catch(err => {
      this.isInitialized = true;
      // do nothing - let the default values then apply
    });
  }

}
