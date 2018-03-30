import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { dataURItoBlob } from 'app/core/util/utils';

@Injectable()
export class MarketService {

  // hostname: string = 'dev1.particl.xyz';
  hostname: string = 'localhost';
  port: number = 3000;
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
          let err = '';
          if (error.status === 404) {
            err = error.error.error;
          } else {
            err = error;
          }
          return Observable.throw(err);
        })
  }

  public uploadImage(templateId: number, base64DataURI: any) {
    // Running in browser, delete?
    let form: FormData = new FormData();
    /*
    image: {
      options: {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      },
      value: new Buffer(base64)
    }*/
    console.log('image length, ', base64DataURI.length);
    const blob: Blob = dataURItoBlob(base64DataURI);
    console.log('blob length, ', blob.size);
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
          return Observable.throw(err);
        })
  }
}
