import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from '../../market-state/market-state.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { ReportCacheService } from 'app/core/market/market-cache/report-cache.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { Listing } from 'app/core/market/api/listing/listing.model';




@Injectable()
export class ReportService implements OnDestroy {

  private log: any = Log.create('report.service id:' + Math.floor((Math.random() * 1000) + 1));
  private defaultProfileId: number;
  private destroyed: boolean = false;

  constructor(
    private market: MarketService,
    private marketState: MarketStateService,
    private profile: ProfileService,
    public cache: ReportCacheService,
    private snackbar: SnackbarService
  ) {
    this.profile.default().takeWhile(() => !this.destroyed).subscribe((prof: any) => {
      this.defaultProfileId = prof.id;
      this.marketState.register('flag', 60 * 1000, ['list', prof.id]);
    });
  }

  add(listing: Listing) {
    return this.market.call('flag', ['add', this.defaultProfileId, listing.hash])
    .do((data) => {
      this.cache.update();
    });
  }

  remove(listing: Listing) {
    return this.market.call('flag', ['remove', this.defaultProfileId, listing.hash])
      .do((data) => {
        this.cache.update();
      });
  }

  toggle(listing: Listing): void {
    if (this.cache.isReported(listing) === true) {
      this.remove(listing).take(1).subscribe(res => {
        this.snackbar.open(`${listing.title} removed from Favorites`);
      });
    } else {
      this.add(listing).take(1).subscribe(res => {
        this.snackbar.open(`${listing.title} added to Favorites`);
      });
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
