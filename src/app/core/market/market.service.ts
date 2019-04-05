
import {throwError as observableThrowError,  Observable, interval } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Log } from 'ng2-logger';

import { dataURItoBlob } from 'app/core/util/utils';
import { environment } from '../../../environments/environment';
import { takeWhile, map, catchError } from 'rxjs/operators';
import { IpcService } from 'app/core/ipc/ipc.service';

@Injectable()
export class MarketService {

  private log: any = Log.create('market-service id: ' + Math.floor((Math.random() * 1000) + 1));
  public isMarketStarted: boolean = false;
  public _checkMarket: any;

  // hostname: string = 'dev1.particl.xyz';
  // hostname: string = 'localhost';
  // port: number = 3000;
  hostname: string = environment.marketHost;
  port: number = environment.marketPort;

  url: string = `http://${this.hostname}:${this.port}/api/rpc`;
  imageUrl: string = `http://${this.hostname}:${this.port}/api/item-images/template/`;

  constructor(
    private _http: HttpClient,
    private _ipc: IpcService
  ) { }

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
        .pipe(map((response: any) => response.result))
        .pipe(catchError((error: any) => {
          this.log.d('Market threw an error!');
          this.log.d('Market error:', error);
          error = this.extractMPErrorMessage(error.error);
          return observableThrowError(error);
        }))
  }

  public uploadImage(templateId: number, base64DataURIArray: any[]) {
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
    for (let idx = 0; idx < base64DataURIArray.length; idx++) {
      const blob = dataURItoBlob(base64DataURIArray[idx]);

      form.append(`image-${idx}`, blob, 'image.jpg');
    }

    const headerJson = {
      // 'Content-Type': 'multipart/form-data'
    };
    const headers = new HttpHeaders(headerJson);

    return this._http.post(this.imageUrl + templateId, form, { headers: headers })
      .pipe(catchError((error: any) => {
          return observableThrowError(this.extractMPErrorMessage(error.error));
        })
      )
  }

  private extractMPErrorMessage(errorObj: any): string {
    if (errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    } else if (errorObj && Object.prototype.toString.call(errorObj.error) === '[object Object]') {
      return this.extractMPErrorMessage(errorObj.error);
    }
    return 'Invalid marketplace request';
  }

  startMarket(wallet: string): Observable<any> {
    return new Observable((observer) => {

      if (this.isMarketStarted) {
        observer.next(this.isMarketStarted);
        observer.complete();
        return;
      }
      if (window.electron) {
        this._ipc.runCommand('start-market', null, wallet);
        this._checkMarket =
          interval(1000)
            .pipe(takeWhile(() => !this.isMarketStarted))
            .subscribe(() => {
              this.call('profile', ['list'])
                .pipe(map((profiles) => profiles.length > 0))
                .subscribe((started) => {
                  if (started) {
                    this.isMarketStarted = started;
                    observer.next(started);
                    observer.complete();
                  }
                });
            });
      } else {
        observer.complete()
      }
    });
  }

  stopMarket() {
    if (window.electron) {
      this._checkMarket.unsubscribe();
      this._ipc.runCommand('stop-market', null, null);
      this.isMarketStarted = false;
    }
  }
}
