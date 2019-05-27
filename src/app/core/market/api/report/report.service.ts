import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Listing } from 'app/core/market/api/listing/listing.model';
import { Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';


@Injectable()
export class ReportService implements OnDestroy {

  private log: any = Log.create('report.service id:' + Math.floor((Math.random() * 1000) + 1));
  private defaultProfileId: number;
  private destroyed: boolean = false;
  private profile$: Subscription;

  constructor(
    private market: MarketService,
    private profile: ProfileService
  ) {}

  start() {
    this.profile$ = this.profile.default().pipe(takeWhile(() => !this.destroyed)).subscribe((prof: any) => {
      this.defaultProfileId = prof.id;
    });
  }

  stop() {
    this.profile$.unsubscribe();
  }

  post(listing: Listing) {
    return this.market.call('item', ['flag', listing.hash, this.defaultProfileId]);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
