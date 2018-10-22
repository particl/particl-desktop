import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MarketService } from 'app/core/market/market.service';

import { Address } from './address.model';

@Injectable()
export class AddressService {

  constructor(
    private market: MarketService,
  ) { }

  add(address: Address): Observable<any> {
    return this.market.call('profile', [
      'address', 'add', 1,
      address.title,
      address.firstName,
      address.lastName,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.country,
      address.zipCode
    ]);
  }

  update(address: Address): Observable<any> {
    return this.market.call('profile', [
      'address', 'update',
      address.id,
      address.title,
      address.firstName,
      address.lastName,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.country,
      address.zipCode
    ]);
  }

}
