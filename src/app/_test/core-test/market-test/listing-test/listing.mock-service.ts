import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { searchData, getData } from 'app/_test/core-test/market-test/listing-test/mock-data';

/*
    This is a fake mock service used for the RpcService.
*/
@Injectable()
export class MockListingService {

  search(page: number, pageLimit: number, profileId: number | string,
    search: string, catId: number, country: any, flag: boolean): Observable<Array<any>> {
    return of(searchData);
  }

  get(id: number): Observable<any> {
    return of(getData);
  }
};
