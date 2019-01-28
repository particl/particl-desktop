import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
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

      case 'template':

        const escape = ['add', 'post', 'remove', 'search', 'get']
        // for sub cmds
        if (params && params[0] && params[1] && !escape.includes(params[0])) {
          response = Responses[method][params[0]][params[1]];
        } else if (params && params[0]) {
          response = Responses[method][params[0]];
        }
        break;

      case 'item':
        response = Responses[method][params[0]];
        break;

      default:
        response = []
    }
    return Observable.of(response);
  }
};
