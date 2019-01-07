import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { executeData } from './mock-data'
import { Command } from 'app/core-ui/main/status/modal/help-modal/command.model';
import { Country } from 'app/core/market/api/countrylist/country.model';
import { GpsMarker } from 'app/core/market/api/template/location/gps.model';

@Injectable()
export class LocationMockService {

  constructor() { }

  execute(method: Command, itemTemplateId: number, region: Country, address: string, gps: GpsMarker): Observable<any> {

    return of(executeData);
  }

}
