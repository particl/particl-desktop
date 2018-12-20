
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';

import { dataURItoBlob } from 'app/core/util/utils';
import { environment } from '../../../environments/environment';

@Injectable()
export class MarketService {

  private log: any = Log.create('rpc-state.class');

  // hostname: string = 'dev1.particl.xyz';
  // hostname: string = 'localhost';
  // port: number = 3000;
  hostname: string = environment.marketHost;
  port: number = environment.marketPort;

  url: string = `http://${this.hostname}:${this.port}/api/rpc`;
  imageUrl: string = `http://${this.hostname}:${this.port}/api/item-images/template/`;

  constructor(private _http: HttpClient) { }

  public call(method: string, params?: Array<any> | null): Observable<any> {
    // Running in browser, delete?
    const postData = JSON.stringify({
      method: method,
      params: params,
      id: 1,
      jsonrpc: '2.0'
    });

    const headerJson = {
      'Content-Type': 'application/json',
      // 'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`), // we hijack the http request in electron
      'Accept': 'application/json',
    };
    const headers = new HttpHeaders(headerJson);

    return this._http.post(this.url, postData, { headers: headers })
        .map((response: any) => response.result)
        .catch((error: any) => {
          this.log.d('Market threw an error!');
          this.log.d('Market error:', error);
          error = this.extractMPErrorMessage(error.error);
          return observableThrowError(error);
        })
  }

  public uploadImage(templateId: number, base64DataURI: any) {
    // Running in browser, delete?
    const form: FormData = new FormData();
    /*
    image: {
      options: {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      },
      value: new Buffer(base64)
    }*/
    const blob: Blob = dataURItoBlob(base64DataURI);
    form.append('image', blob, 'image.jpg');


    const headerJson = {
      // 'Content-Type': 'multipart/form-data'
    };
    const headers = new HttpHeaders(headerJson);

    return this._http.post(this.imageUrl + templateId, form, { headers: headers })
//        .map((response: any) => response.result)
        .catch((error: any) => {
          let err = '';
          if (error.status === 404) {
            err = error.error.error;
          } else {
            err = error;
          }
          return observableThrowError(err);
        })
  }

  private extractMPErrorMessage(errorObj: any): string {
    if (errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    } else if (errorObj && Object.prototype.toString.call(errorObj.error) === '[object Object]') {
      return this.extractMPErrorMessage(errorObj.error);
    }
    return 'Invalid marketplace request';
  }
}
