import { Injectable, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from '../../market-state/market-state.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { FavoriteCacheService } from 'app/core/market/market-cache/favorite-cache.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

import { Listing } from 'app/core/market/api/listing/listing.model';
import { Subscription } from 'rxjs';
import { tap, takeWhile, take } from 'rxjs/operators';


@Injectable()
export class FavoritesService implements OnDestroy {

  private log: any = Log.create('favorite.service id:' + Math.floor((Math.random() * 1000) + 1));
  private defaultProfileId: number;
  private destroyed: boolean = false;
  private profile$: Subscription;

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    private profile: ProfileService,
    public cache: FavoriteCacheService,
    private snackbar: SnackbarService
  ) {}

  start() {
    this.profile$ = this.profile.default().pipe(takeWhile(() => !this.destroyed)).subscribe((prof: any) => {
      this.defaultProfileId = prof.id;
      this.marketState.register('favorite', 60 * 1000, ['list', prof.id]);
    });
  }

  stop() {
    this.profile$.unsubscribe();
  }

  add(listing: Listing) {
    return this.market.call('favorite', ['add', this.defaultProfileId, listing.id])
    .pipe(tap(((data) => {
      this.cache.update();
    })));
  }

  remove(listing: Listing) {
    return this.market.call('favorite', ['remove', this.defaultProfileId, listing.id])
      .pipe(tap(((data) => {
        this.cache.update();
      })));
  }

  toggle(listing: Listing): void {
    if (this.cache.isFavorited(listing) === true) {
      this.remove(listing).pipe(take(1)).subscribe(res => {
        this.snackbar.open(`${listing.title} removed from Favorites`);
      });
    } else {
      this.add(listing).pipe(take(1)).subscribe(res => {
        this.snackbar.open(`${listing.title} added to Favorites`);
      });
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
