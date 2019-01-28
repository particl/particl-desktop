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

  constructor(
    private market: MarketService,
    private profile: ProfileService
  ) {

    this.profile.default().takeWhile(() => !this.destroyed).subscribe((prof: any) => {
      this.defaultProfileId = prof.id;
    });
  }

  post(listingHash: string) {
    return this.market.call('item', ['flag', listingHash, this.defaultProfileId])
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
