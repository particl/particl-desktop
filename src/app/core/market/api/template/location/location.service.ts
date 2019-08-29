import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';
import { GpsMarker } from './gps.model';
import { Country } from 'app/core/market/api/countrylist/country.model';

type Command = 'add' | 'update';

@Injectable()
export class LocationService {

  log: any = Log.create('location.service');
  constructor(private market: MarketService) {
  }

  execute(method: Command, itemTemplateId: number, region: Country, address: string, gps: GpsMarker): Observable<any> {
    const params = [
      'location',
      method,
      itemTemplateId,
      region ? region.iso : null,
      address || 'a'
    ];
    if (gps) {
      params.push(gps.title ? gps.title : null);
      params.push(gps.description ? gps.description : null);
      params.push(gps.lat ? gps.lat : null);
      params.push(gps.long ? gps.long : null);
    }
    return this.market.call('template', params);
  }
}
