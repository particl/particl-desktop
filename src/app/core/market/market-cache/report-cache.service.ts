import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Log } from 'ng2-logger';

import { ReportService } from '../api/report/report.service';
import { Report } from '../api/report/report.model';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { Listing } from 'app/core/market/api/listing/listing.model';

@Injectable()
export class ReportCacheService {

  private log: any = Log.create('report-cache.service id:' + Math.floor((Math.random() * 1000) + 1));
  public reports: Report[];

  constructor(
    private marketState: MarketStateService,
  ) {
    // subscribe to changes
    this.getReports().subscribe((report: Report[]) => {
      this.reports = report;
    });
   }

  isReported(listing: Listing): boolean {
    const listingItemId = listing.id;
    const index = _.findIndex(this.reports, function (obj: Report) {
      return obj.listingItemId === listingItemId;
    });
    return (index > -1)
  }

  update() {
    this.marketState.register('flag', null, ['list', 1]);
  }

  getReports() {
    return this.marketState.observe('flag');
  }

}
