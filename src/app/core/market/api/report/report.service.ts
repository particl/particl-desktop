import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Listing } from 'app/core/market/api/listing/listing.model';


@Injectable()
export class ReportService implements OnDestroy {

  private log: any = Log.create('report.service id:' + Math.floor((Math.random() * 1000) + 1));
  private defaultProfileId: number;
  private destroyed: boolean = false;
  private isEnabled: boolean = false;

  constructor(
    private market: MarketService,
    private profile: ProfileService
  ) {}

  start() {
    this.isEnabled = true;

    this.profile.default().takeWhile(() => !this.destroyed && this.isEnabled).subscribe((prof: any) => {
      this.defaultProfileId = prof.id;
    });
  }

  stop() {
    this.isEnabled = false;
  }

  post(listing: Listing) {
    return this.market.call('item', ['flag', listing.hash, this.defaultProfileId])
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
