import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { Listing } from 'app/core/market/api/listing/listing.model';


@Injectable()
export class ReportService {

  private log: any = Log.create('report.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  constructor(
    private market: MarketService,
  ) {
  }

  post(listing: Listing) {
    return this.market.call('report', ['add', listing.id, listing.proposalOption])
  }
}
