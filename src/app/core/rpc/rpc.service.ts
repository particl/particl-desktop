import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Log } from 'ng2-logger';
import { Headers, Http, RequestOptions } from '@angular/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class RPCService {

  private log: any = Log.create('rpc.service');

  // don't know what was the plan regarding those todo's,
  // below values are now set based on the environent
  private hostname: String = environment.server.hostname; // TODO: URL Flag / Settings
  private port: number = environment.server.port;         // TODO: Mainnet / testnet flag...
  private username: string = environment.server.username;
  private password: string = environment.server.password;

  private _callOnBlock: Array<any> = [];
  private _callOnTransaction: Array<any> = [];

  private _pollTimout: number;

  public isElectron: boolean = false;

  constructor(private http: Http, public electronService: ElectronService) {
    this.isElectron = this.electronService.isElectronApp;

    this.log.d('configured to use API_URL:', this.getApiUrl());
    this.log.d('authenticating with username: ' + this.username + 'and password: ' + this.password);
  }

  call(instance: Injectable, method: string, params: Array<any> | null, successCB: Function, errorCB?: Function): void {

    const apiUrl = this.getApiUrl();
    const postData = this.getPostData(method, params);
    const options = this.getRequestOptions();

    if (this.isElectron) {
      // TODO: electron.ipcCall
    } else {
      this.http
        .post(apiUrl, postData, options)
        .subscribe(
          response => {
            successCB.call(instance, response.json().result);
          },
          error => {
            if (errorCB) {
              errorCB.call(instance, JSON.parse(error['_body']))
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

  startPolling(): void {
    clearTimeout(this._pollTimout);
    this.poll();
  }

  stopPolling(): void {
    clearTimeout(this._pollTimout);
  }

  /**
   * returns the headers for a common api request
   * @returns {Headers}
   */
  getHeaders(): any {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', 'Basic ' + btoa(`${this.username}:${this.password}`));
    headers.append('Accept', 'application/json');
    return headers;
  }

  getRequestOptions(): RequestOptions {
    return new RequestOptions({ method: 'POST', headers: this.getHeaders() });
  }

  getPostData(method: string, params: Array<any> | null): string {
    return JSON.stringify({
      method: method,
      params: params,
      id: 1
    });
  }

  /**
   *
   * @returns {string}
   */
  getApiUrl(): string {
    return 'http://' + this.hostname + ':' + this.port;
  }
}
