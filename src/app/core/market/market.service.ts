import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class MarketService {

  hostname: string = 'dev1.particl.xyz';
  port: number = 3200;
  url = `http://${this.hostname}/api/rpc`;

  constructor(private _http: HttpClient) {
   }

  call(method: string, params?: Array<any> | null): Observable<any> {

      // Running in browser, delete?
      const postData = JSON.stringify({
        method: method,
        params: params,
        id: 1,
        jsonrpc: '2.0'
      });



      let headerJson = {
       'Content-Type': 'application/json',
       // 'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`), // we hijack the http request in electron
       'Accept': 'application/json',
      };
      let headers = new HttpHeaders(headerJson);

      return this._http
        .post(this.url, postData, { headers: headers })
        .pipe(
          map((response: any) => response.result),
          catchError(error => Observable.throw(error)
          )
        );
  }
}
