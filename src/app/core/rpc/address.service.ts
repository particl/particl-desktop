import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { RPCService } from './rpc.service';
import { AddressCount } from './models/address-count.model';
import { Address } from './models/address.model';

@Injectable()
export class AddressService {

  constructor(public rpc: RPCService) {
  }

  getAddressCounts() {
    return new AddressCount( 3, 2, 1 );
  }

  getAddresses() {
    return [
      new Address('pVKDSMvZTweE9gn7eVvCHZZNMk7KYWnYv5', 'label1', 'true', 'aaRmhyFuQurvKjp6wjxQxhJRUh7B2ApthL', 'm/0/4'),
      new Address('pWgjuhzPbtVSCe359iiareeSBnQW4mVnTG', 'label2', 'true', 'aaRmhyFuQurvKjp6wjxQxhJRUh7B2ApthL', 'm/0/19'),
      new Address('psPefBX8uwvppMcP6TfWJiwMgkj5Pqvwyw', 'label3', 'true', 'aaRmhyFuQurvKjp6wjxQxhJRUh7B2ApthL', 'm/0/16'),
    ];
  }
}
