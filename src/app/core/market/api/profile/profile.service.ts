import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

import { AddressService } from './address/address.service';
import { Profile } from './profile.model';
import { tap, map, takeWhile, find, distinctUntilChanged } from 'rxjs/operators';

// TODO: addresses & favourites!
@Injectable()
export class ProfileService implements OnDestroy {

  private log: any = Log.create('profile.service id:' + Math.floor((Math.random() * 1000) + 1));

  private defaultProfileId: number;
  private destroyed: boolean = false;
  private profile$: Subscription;

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    public address: AddressService
  ) {
  }

  start() {
    // find default profile
    this.profile$ = this.defaultId().pipe(takeWhile(() => !this.destroyed)).subscribe((id: number) => {
      this.log.d('setting default profile id to ' + id);
      this.defaultProfileId = id;
    });
  }

  stop() {
    this.profile$.unsubscribe();
  }

  list() {
    return this.marketState.observe('profile')
    .pipe(distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)));
  }

  // return the default profile
  default() {
    return new Observable((observer) => {
      this.list()
      .pipe(map(profiles => profiles.find(profile => profile.name === 'DEFAULT')))
      .subscribe(defaultProfile => {
        // do a new get request to get the _full_ profile.
        // includes ShippingAddresses, CryptoAddresses etc
        if (defaultProfile && defaultProfile.id) {
          this.get(defaultProfile.id).subscribe(full => observer.next(full));
        }
      })
    });
  }

  defaultId(): Observable<number> {
    return this.default()
    .pipe(map((defaultProfile: any) => defaultProfile.id));
  }

  get(profileIdOrName: number | string): Observable<any> {
    return this.market.call('profile', ['get', profileIdOrName])
            .pipe(map((data) => new Profile(data)))
  }

  add(profileName: string, profileAddress?: string): Observable<any> {
    const params = ['add', profileName, profileAddress];
    if (profileAddress === null) {
      params.pop(); // if null pop parent
    }
    return this.market.call('profile', params)
    .pipe(tap(() => {
      this.refresh();
    }));
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
