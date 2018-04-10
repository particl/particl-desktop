import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ShippingDetails } from '../../../../market/shared/shipping-details.model';
import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

// TODO: addresses & favourites!
@Injectable()
export class ProfileService {

  // @TODO: added for checkout process
  public shippingDetails: ShippingDetails;
  public stepper: number = 0;

  constructor(
    private market: MarketService,
    private marketState: MarketStateService
  ) { }

  list() {
    return this.marketState.observe('profile')
    .distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b));
  }

  get(profileIdOrName: number | string): Observable<any> {
    return this.market.call('profile', ['get', profileIdOrName]);
  }

  add(profileName: string, profileAddress?: string): Observable<any> {
    const params = ['add', profileName, profileAddress];
    if (profileAddress === null) {
      params.pop(); // if null pop parent
    }
    return this.market.call('profile', params);
  }

  addShippingAddress(shippingAddress: any): Observable<any> {
    console.log('addShippingAddress>>>', shippingAddress);
    return this.market.call('profile', [
      'address', 'add', 1,
      shippingAddress.firstName,
      shippingAddress.lastName,
      (shippingAddress.title) ? shippingAddress.title : 'DEFAULT', // title
      shippingAddress.addressLine1,
      shippingAddress.addressLine2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.country,
      shippingAddress.zipCode
    ]);
  }

  updateShippingAddress(shippingAddress: any): Observable<any> {
    return this.market.call('profile', [
      'address', 'update',
      shippingAddress.id,
      shippingAddress.firstName,
      shippingAddress.lastName,
      (shippingAddress.title) ? shippingAddress.title : 'DEFAULT', // title
      shippingAddress.addressLine1,
      shippingAddress.addressLine2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.country,
      shippingAddress.zipCode
    ]);
  }

  update(profileId: number, profileName: string): Observable<any> {
    return this.market.call('profile', ['update', profileId, profileName]);
  }

  remove(profileIdOrName: number | string): Observable<any> {
    return this.market.call('profile', ['remove', profileIdOrName]);
  }

  search(searchString: string): Observable<any> {
    return this.market.call('profile', ['search', searchString]);
  }
}
