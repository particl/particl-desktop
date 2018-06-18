import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger';

import { Address } from './address/address.model';
import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { AddressService } from './address/address.service';
import { Profile } from './profile.model';

// TODO: addresses & favourites!
@Injectable()
export class ProfileService implements OnDestroy {

  private log: any = Log.create('profile.service id:' + Math.floor((Math.random() * 1000) + 1));

  private defaultProfileId: number;
  private destroyed: boolean = false;

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    public address: AddressService
  ) {
    // find default profile
    this.defaultId().takeWhile(() => !this.destroyed).subscribe((id: number) => {
      this.log.d('setting default profile id to ' + id);
      this.defaultProfileId = id;
    });
  }

  list() {
    return this.marketState.observe('profile')
    .distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b));
  }

  // return the default profile
  default() {
    return new Observable((observer) => {
      this.list()
      .map(profiles => profiles.find(profile => profile.name === 'DEFAULT'))
      .subscribe(defaultProfile => {
        // do a new get request to get the _full_ profile.
        // includes ShippingAddresses, CryptoAddresses etc
        this.get(defaultProfile.id).subscribe(full => observer.next(full));
      })
    });
  }

  defaultId(): Observable<number> {
    return this.default()
    .map((defaultProfile: any) => defaultProfile.id);
  }

  get(profileIdOrName: number | string): Observable<any> {
    return this.market.call('profile', ['get', profileIdOrName])
            .map((data) => new Profile(data))
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

  ngOnDestroy() {
    this.destroyed = true;
  }
}
