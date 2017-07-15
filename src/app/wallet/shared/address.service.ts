import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observer } from 'rxjs/Observer';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { RpcModule, AddressRpcService } from '../../core/rpc/rpc.module';
import { AddressCount } from '../../core/rpc/models/address-count.model';
import { Address } from '../../core/rpc/models/address.model';
import {ElectronService} from 'ngx-electron';

@Injectable()
export class AddressService {

  log: any = Log.create('address.service');

  constructor(private api: AddressRpcService) {
  }

  getAddressCount(): Observable<AddressCount> {
    return this.api.getAddressCount();
  }

  findAddresses(params: Array<any>): Observable<Address[]> {
    return this.api.findAddresses(params);
  }

  removeAddress(address: string): Observable<Address> {
    return this.api.removeAddress(address);
  }
}
