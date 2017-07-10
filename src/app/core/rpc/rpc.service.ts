import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { Headers, Http } from '@angular/http';

const MAINNET_PORT = 51935;
const TESTNET_PORT = 51935;

const HOSTNAME = 'localhost';

@Injectable()
export class RPCService {
  private hostname: String = HOSTNAME; // TODO: URL Flag / Settings
  private port: number = TESTNET_PORT; // TODO: Mainnet / testnet flag...

  private username: string = 'test';
  private password: string = 'test';

  private _callOnBlock: Array<any> = [];
  private _callOnTransaction: Array<any> = [];
  private _callOnAddress: Array<any> = [];

  private _pollTimout: number;

  public isElectron: boolean = false;

  constructor(private http: Http, public electronService: ElectronService) {
    this.isElectron = this.electronService.isElectronApp;
  }

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
              errorCB.call(instance, error)
            }
            // TODO: Call error modal?
            console.log('RPC Call returned an error', error);
          });
    }
  }

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
    if (when.indexOf('address') !== -1 || when.indexOf('both') !== -1) {
      console.log('registering address call');
      this._callOnAddress.push(_call);
      valid = true;
    }
  }

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


  specialPoll(): void {
    // A poll only for address changes, triggered from the GUI!

    const _call = (element) => {
      this.call(
        element.instance,
        element.method,
        element.params && element.params.typeOf === 'function' ? element.params() : element.params,
        element.successCB,
        element.errorCB);
    };

    this._callOnAddress.forEach(_call);
  }

  startPolling(): void {
    clearTimeout(this._pollTimout);
    this.poll();
  }

  stopPolling(): void {
    clearTimeout(this._pollTimout);
  }

}
