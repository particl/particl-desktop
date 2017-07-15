import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { RPCService } from './rpc.service';
import { AddressCount } from './models/address-count.model';
import { Address } from './models/address.model';
import { Http } from '@angular/http';
import {ElectronService} from 'ngx-electron';

@Injectable()
export class AddressRpcService {

  log: any = Log.create('address-rpc.service');

  private API_URL: string = '';

  /**
   *
   * @param http
   * @param rpc
   */
  constructor(private http: Http, public rpc: RPCService) {
    this.API_URL = this.rpc.getApiUrl();
  }

  public getAddressCount(): Observable<AddressCount> {
    const postData = this.rpc.getPostData('filteraddresses', [-1]);
    const options = this.rpc.getRequestOptions();
    return this.http
      .post(this.API_URL, postData, options )
      .map(response => {
        const addressCount = response.json().result;
        this.log.d('getAddressCount, addressCount:', addressCount);
        return new AddressCount(addressCount);
      })
      .catch(this.handleError);
  }

  public findAddresses(params: Array<any>): Observable<Address[]> {
    const postData = this.rpc.getPostData('filteraddresses', params);
    const options = this.rpc.getRequestOptions();
    return this.http
      .post(this.API_URL, postData, options )
      .map(response => {
        const addresses = response.json().result;
        return addresses.map((address) => new Address(address));
      })
      .catch(this.handleError);
  }

  /**
   * TODO: not implemented, just calling filteraddresses and returning null, I'm not sure if deleting addresses is even possible
   *
   * @param address
   * @returns {Observable<R|T>}
   */
  public removeAddress(address: string): Observable<null> {
    const postData = this.rpc.getPostData('filteraddresses', null);
    const options = this.rpc.getRequestOptions();
    return this.http
      .post(this.API_URL, postData, options )
      .map(response => null)
      .catch(this.handleError);
  }

  private handleError (error: Response | any) {
    const errorMsg = (error.message) ? error.message : error.status ? error.status + ' - ' + error.statusText : 'Server error';
    this.log.error('handleError: ', errorMsg);
    return Observable.throw(errorMsg);
  }
}
