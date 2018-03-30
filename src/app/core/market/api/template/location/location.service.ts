import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { GpsMarker } from './gps.model';
import { Country } from 'app/core/market/api/countrylist/country.model';


@Injectable()
export class LocationService {

  log: any = Log.create('location.service');

  constructor(private market: MarketService) {
  }

  update(itemTemplateId: number, region: Country, address: string, gps: GpsMarker): Observable<any> {
    return this.market.call('template',
      [
        'location',
        'add',
        itemTemplateId,
        region.iso,
        address || 'a',
        gps ? gps.title : null,
        gps ? gps.description : null,
        gps ? gps.lat : null,
        gps ? gps.long : null
      ]);
  }
}
