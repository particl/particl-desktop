import { Injectable, OnInit } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { AddressService } from './address.service';
import { Address, deserialize } from './address.model';
import { filterAddress } from 'app/_test/core-test/rpc-test/mock-data/filteraddress.mock';
/*
    This is a fake mock service used for the AddressMockService.
*/
@Injectable()
export class MockAddressService {
  public _addresses: Observable<Array<Address>>;
  public _observerAddresses: Observer<Array<Address>>;

  constructor() {
    this._addresses = Observable.create(observer => {
      const response =  this._observerAddresses = observer
      this.updateAddressList();
      return response;
    }).publishReplay(1).refCount();
  }

  updateAddressList() {
    const json = filterAddress['addresses'];
    let addresses: Address[] = [];
    json.forEach((resp) => addresses = this.addAddress(addresses, resp));
    this._observerAddresses.next(addresses);
  }

  getAddresses(): void {
    this.updateAddressList()
  }

  private addAddress(addresses: Address[], json: Object): Address[] {
    const instance = deserialize(json, Address);

    if (typeof instance.address === 'undefined') {
      return;
    }
    addresses.unshift(instance);
    return addresses;
  }

};
