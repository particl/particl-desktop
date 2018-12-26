import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { searchListings } from '../market-api-mock-data/listing/search';
import { getListing } from 'app/core/market/api/market-api-mock-data/listing/get';
import { searchOwnListings } from 'app/core/market/api/market-api-mock-data/listing/searchOwn';

/*
    This is a fake mock service used for the RpcService.
*/
@Injectable()
export class MockListingService {

  searchOwn(page: number, pageLimit: number, profileId: number | string,
    search: string, catId: number, country: any, flag: boolean): Observable<Array<any>> {
    return of(searchOwnListings)
  }

  search(page: number, pageLimit: number, profileId: number | string,
    search: string, catId: number, country: any, flag: boolean): Observable<Array<any>> {
    return of(searchListings)
  }

  get(id: number): Observable<any> {
    return of(getListing)
  }
};
