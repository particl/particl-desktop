import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Address } from './address/address.model';
import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { AddressService } from './address/address.service';

// TODO: addresses & favourites!
@Injectable()
export class ProfileService {

  private defaultProfileId: number;

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    public address: AddressService
  ) {
    // find default profile
    this.list().subscribe((profiles: any[]) => {
      this.defaultProfileId = profiles.find((e) => e.name === 'DEFAULT').id;
    });
  }

  list() {
    return this.marketState.observe('profile')
    .distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b));
  }

  // return the default profile
  default() {
    return this.get(this.defaultProfileId);
  }

  get(profileIdOrName: number | string): Observable<any> {
    return this.market.call('profile', ['get', profileIdOrName])
    .do((profile) => {
      console.log(profile);
    });
  }

  add(profileName: string, profileAddress?: string): Observable<any> {
    const params = ['add', profileName, profileAddress];
    if (profileAddress === null) {
      params.pop(); // if null pop parent
    }
    return this.market.call('profile', params)
    .do(() => {
      this.refresh();
    });
  }

  refresh(): void {

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
