import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Responses } from 'app/_test/core-test/market-test/mock-data/mock-market.responses';

/*
  This is a fake mock service used for the MarketService.
  so we have to override it in all tests that use the Services/ Components.
*/

@Injectable()
export class MockMarketService {

  call(method: string, params?: Array<any> | null): Observable<any> {
    let response = {}

    switch (method) {
      case 'proposal':

        response = Responses[method][params[0]] || Responses[method][404];
        break;

      case 'vote':

        response = Responses[method][params[0]];
        break;

      case 'item':
        response = Responses[method][params[0]];
        break;

      default:
        response = []
    }
    return of(response);
  }
};
