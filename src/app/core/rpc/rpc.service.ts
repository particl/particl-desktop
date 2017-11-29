import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Log } from 'ng2-logger';

import { IpcService } from '../ipc/ipc.service';
import { StateService } from '../state/state.service';
import { RpcStateClass } from './rpc-state/rpc-state.class';


const MAINNET_PORT = 51735;
const TESTNET_PORT = 51935;

const HOSTNAME = 'localhost';


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
export class RpcService {
  /**
   * IP/URL for daemon (default = localhost)
   */
  private hostname: String = HOSTNAME; // TODO: URL Flag / Settings

  /**
   * Port number of of daemon (default = 51935)
   */
  private port: number = TESTNET_PORT; // TODO: Mainnet / testnet flag...

  private username: string = 'test';
  private password: string = 'test';

  private _callOnAddress: Array<any> = [];
  private _callOnPoll: Array<any> = [];
  private _callOnNextPoll: Array<any> = [];

  private _enableState: boolean = true;

  public isElectron: boolean = false;

  private log: any = Log.create('rpc.service');

  /** errors gets updated everytime the stateCall RPC requests return an error */
  public errorsStateCall: Subject<any> = new Subject<any>();

  private _rpcState: RpcStateClass;

  constructor(
    private _http: Http,
    private _ipc: IpcService,
    public state: StateService
  ) {
    this.isElectron = window.electron;

    this.toggleState(true);
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
   * TODO: Response interface
   */
  call(method: string, params?: Array<any> | null): Observable<any> {

    if (this.isElectron) {
      return this._ipc.runCommand('rpc-channel', null, method, params)
        .map(response => response && (response.result !== undefined)
                       ? response.result
                       : response);
    } else {
      // Running in browser, delete?
      const postData = JSON.stringify({
        method: method,
        params: params,
        id: 1
      });

      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', 'Basic ' + btoa(`${this.username}:${this.password}`));
      headers.append('Accept', 'application/json');

      return this._http
      .post(`http://${this.hostname}:${this.port}`, postData, { headers: headers })
        .map(response => response.json().result)
        .catch(error => Observable.throw(
          typeof error._body === 'object' ? error._body : JSON.parse(error._body)));
    }
  }

// TODO; MOVE rpc-state stuff into own services, clouding it up here
  /**
   * Make an RPC Call that saves the response in the state service.
   *
   * @param {string} method  The JSON-RPC method to call, see ```./particld help```
   * @param {boolean>} withMethod  Should the state be saved under the method name.
   *   i.e.: {rpcMethod: response}
   *
   * The rpc call and state update will only take place while `this._enableState` is `true`
   *
   * @example
   * ```JavaScript
   * this._rpc.stateCall('getwalletinfo');
   * ```
   */
  stateCall(method: string, withMethod?: boolean): void {

    if (!this._enableState) {
      return;
    }

    this.call(method)
      .subscribe(
        this.stateCallSuccess.bind(this, withMethod ? method : false),
        this.stateCallError  .bind(this, withMethod ? method : false, false));
  }

  /** Register a state call, executes every X seconds (timeout) */
  registerStateCall(method: string, timeout?: number, params?: Array<any> | null): void {
    if (timeout) {
      let firstError = true;

      // loop procedure
      const _call = () => {
        if (!this._enableState) {
          // re-start loop after timeout - keep the loop going
          setTimeout(_call, timeout);
          return;
        }
        this.call(method, params)
          .subscribe(
            success => {
              this.stateCallSuccess(success);

              // re-start loop after timeout
              setTimeout(_call, timeout);
            },
            error => {
              this.stateCallError(error, method, firstError);

              setTimeout(_call, firstError ? 250 : error.status === 0 ? 500 : 10000);
              firstError = false;
            });
      };
      // initiate loop
      _call();
    } else {
      this.state.observe('blocks') .subscribe(success => this.stateCall(method, true));
      this.state.observe('txcount').subscribe(success => this.stateCall(method, true));
    }
  }

  /** Updates the state whenever a state call succeeds */
  private stateCallSuccess(success: any, method?: string | boolean) {
    this.errorsStateCall.next(true); // Let's keep it simple

    if (method) {
      if (success) {
        const obj = {};
        obj[success] = method;
        success = obj;
      } else {
        success = method;
      }
    }

    if (success) {
      Object.keys(success).forEach(key => this.state.set(key, success[key]))
    } else {
      this.log.er('stateCallSuccess(): Should not be null, ever!', success, method);
    }
  }

  /** Updates the state when the state call errors */
  private stateCallError(error: any, method: string, firstError: boolean) {
    this.log.er(`stateCallError(): RPC Call ${method} returned an error:`, error);

    // if not first error, show modal
    if (!firstError) {
      this.errorsStateCall.error({
        error: error.target ? error.target : error,
        electron: this.isElectron
      });
    }
  }

  toggleState(enable?: boolean): void {
    this._enableState = enable ? enable : !this._enableState;
    if (this._enableState) {
      // We just execute it.. Might convert it to a service later on
      this._rpcState = new RpcStateClass(this);
    }
  }

}
