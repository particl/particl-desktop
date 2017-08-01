import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { Headers, Http } from '@angular/http';

const MAINNET_PORT = 51935;
const TESTNET_PORT = 51935;

const HOSTNAME = 'localhost';

/**
 * The RPC service that maintains a single connection to the particld daemon.
 *
 * It has two important functions: call and register.
 */

@Injectable()
export class RPCService {
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

  private _callOnBlock: Array<any> = [];
  private _callOnTransaction: Array<any> = [];

  private _pollTimout: number;

  public isElectron: boolean = false;

  constructor(private http: Http, public electronService: ElectronService) {
    this.isElectron = this.electronService.isElectronApp;
    this.poll();
  }

/**
 * The call function will perform a single call to the particld daemon and perform a callback to
 * the instance through the function as defined in the params.
 *
 * @param {Injectable} instance  The instance in which the callback functions reside.
 * @param {string} method  The JSON-RPC method to call, see ```./particld help```
 * @param {Array<Any>} params  The parameters to pass along with the JSON-RPC request.
 * The content of the array is of type any (ints, strings, booleans etc)
 * @param {Function} successCB  The function to callback (in instance) when the RPC request was successful.
 * @param {Function} errorCB  The function to callback (in instance) when the RPC request failed.
 *
 * @example
 * ```JavaScript
 * this._rpc.call(this, 'listtransactions', [0, 20], this.rpc_loadTwentyTxs_success, this.rpc_loadTwentyTxs_failed);
 * ```
 * ```JavaScript
 * rpc_loadTwentyTxs_success(json: Object) {
 *   console.log("Loaded transactions!");
 *   console.log(json);
 * }
 * ...
 * ```
 *
 * @returns      void
 */

  call(instance: Injectable, method: string, params: Array<any> | null, successCB: Function, errorCB?: Function): void {
    const postData = JSON.stringify({
      method: method,
      params: params,
      id: 1
    });
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Basic ' + btoa(`${this.username}:${this.password}`));
    headers.append('Accept', 'application/json');

    if (this.isElectron) {
      // TODO: electron.ipcCall
    } else {
      this.http
        .post(`http://${this.hostname}:${this.port}`, postData, { headers: headers })
        .subscribe(
          response => {
            successCB.call(instance, response.json().result);
          },
          error => {
            if (errorCB) {
              errorCB.call(instance, (typeof error['_body'] === "object" ? error['_body'] : JSON.parse(error['_body'])) )
            }
            // TODO: Call error modal?
            console.log('RPC Call returned an error', error);
          });
    }
  }

/**
 * The register function will register a call to the particld daemon
 * which is executed whenever the trigger happens (new block, new transactions through ZMQ)
 * and performs a callback to the instance through the function as defined in the params.
 *
 * @param {Injectable} instance  The instance in which the callback functions reside.
 * @param {string} method  The JSON-RPC method to call, see ```./particld help```
 * @param {Array<Any>} params  The parameters to pass along with the JSON-RPC request.
 * The content of the array is of type any (ints, strings, booleans etc)
 * @param {Function} successCB  The function to callback (in instance) when the RPC request was successful.
 * @param {string} when  The trigger to register to: 'block' on a new block, 'tx' on a new transactions, 'address' on address changes.
 * @param {Function} errorCB  The function to callback (in instance) when the RPC request failed.
 *
 * @example
 * ```JavaScript
 * this._rpc.register(this, 'listtransactions', [0, 20], this.rpc_loadTwentyTxs_success, 'block' this.rpc_loadTwentyTxs_failed);
 * ```
 * ```JavaScript
 * rpc_loadTwentyTxs_success(json: Object) {
 *   console.log("Loaded transactions!");
 *   console.log(json);
 * }
 * ...
 * ```
 *
 * @returns      void
 */

  register(instance: Injectable, method: string, params: Array<any> | Function | null,
           successCB: Function, when: string, errorCB?: Function): void {
    let valid = false;
    const _call = {
      instance: instance,
      method: method,
      params: params,
      successCB: successCB,
      errorCB: errorCB
    };
    if (when.indexOf('block') !== -1 || when.indexOf('both') !== -1) {
      this._callOnBlock.push(_call);
      valid = true;
    }
    if (when.indexOf('tx') !== -1 || when.indexOf('both') !== -1) {
      this._callOnTransaction.push(_call);
      valid = true;
    }
  }

/**
 * Do one poll: execute all the registered calls.
 *
 * @returns      void
 */
  poll(): void {
    // TODO: Actual polling... Check block height and last transaction
    const _call = (element) => {
      this.call(
        element.instance,
        element.method,
        element.params && element.params.typeOf === 'function' ? element.params() : element.params,
        element.successCB,
        element.errorCB);
    };

    this._callOnBlock.forEach(_call);
    this._callOnTransaction.forEach(_call);

    this._pollTimout = setTimeout(this.poll.bind(this), 3000);
  }

/**
 * Start a temporary loop that polls the RPC every 3 seconds.
 *
 * @returns      void
 */
  startPolling(): void {
    clearTimeout(this._pollTimout);
    this.poll();
  }

/**
 * Stops a temporary loop that polls the RPC every 3 seconds.
 *
 * @returns      void
 */
  stopPolling(): void {
    clearTimeout(this._pollTimout);
  }

}
