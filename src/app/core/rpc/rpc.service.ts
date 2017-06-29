import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { Headers, Http } from '@angular/http';
import { AppService } from 'app/app.service';

const MAINNET_PORT = 51935;
const TESTNET_PORT = 51935;

const HOSTNAME = 'localhost';

@Injectable()
export class RPCService {
  private hostname: String = HOSTNAME; // TODO: URL Flag / Settings
  private port: number = TESTNET_PORT; // TODO: Mainnet / testnet flag...

  private username: string = 'test';
  private password: string = 'test';

  private _appService: AppService;
  private _callOnBlock: Array<any> = [];
  private _callOnTransaction: Array<any> = [];

  private _pollTimout: NodeJS.Timer;

  constructor(private http: Http, public electronService: ElectronService) { }

  postConstruct(appService: AppService) { // Gets rid of circular dependency.. We could possibly handle this better..
    this._appService = appService;
  }

  call(instance: Injectable, method: string, params: Array<any> | null, callback: Function): void {
    const postData = JSON.stringify({
      method: method,
      params: params,
      id: 1
    });
    const headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Basic ' + btoa(`${this.username}:${this.password}`));
    headers.append('Accept', 'application/json');

    if (this._appService.isElectron) {
      // TODO: electron.ipcCall
    } else {
      this.http
        .post(`http://${this.hostname}:${this.port}`, postData, { headers: headers })
        .subscribe(
          response => {
            callback.call(instance, response.json().result);
          },
          error => {
            // TODO: Call error modal?
            console.log('RPC Call returned an error', error);
          });
    }
  }

  register(instance: Injectable, method: string, params: Array<any> | Function | null,
           callback: Function, when: string): void {
    let valid = false;
    const _call = {
      instance: instance,
      method: method,
      params: params,
      callback: callback
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

  poll(): void {
    // TODO: Actual polling... Check block height and last transaction
    let _call = (element) => {
      this.call(
        element.instance,
        element.method,
        element.params && element.params.typeOf === 'function' ? element.params() : element.params,
        element.callback);
    };

    this._callOnBlock.forEach(_call);
    this._callOnTransaction.forEach(_call);
    this._pollTimout = setTimeout(() => { this.poll(); }, 3000);
  }

  startPolling(): void {
    clearTimeout(this._pollTimout);
    this.poll();
  }

  stopPolling(): void {
    clearTimeout(this._pollTimout);
  }

}
