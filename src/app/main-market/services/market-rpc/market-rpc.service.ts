import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError as observableThrowError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


@Injectable()
export class MarketRpcService {

  private url: string = '';


  constructor(
    private _http: HttpClient,
  ) { }


  _setConnectionParams(url: string): boolean {
    if (this.url.length > 0) {
      return false;
    }
    try {
      const _ = new URL(url);
      this.url = url;
      return true;
    } catch (_) { }

    return false;
  }


  _stopConnection(): void {
    this.url = '';
  }


  public call(method: string, params?: Array<any> | null): Observable<any> {

    if (this.url.length === 0) {
      return observableThrowError('Market service not started');
    }

    const postData = {
      method: method,
      params: params,
      id: 1,
      jsonrpc: '2.0'
    };

    const headerJson = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    return this._http.post(this.url + 'api/rpc', postData, { headers: new HttpHeaders(headerJson) }).pipe(
      map((response: any) => response.result),
      catchError((error: any) => {
        error = this.extractMPErrorMessage(error.error);
        return observableThrowError(error);
      })
    );
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
