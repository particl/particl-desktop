import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Responses } from 'app/core/market/mock-data/mock-market.responses';
import { MarketService } from 'app/core/market/market.service';

/*
  This is a fake mock service used for the MarketService.
  so we have to override it in all tests that use the Services/ Components.
*/

@Injectable()
export class MockMarketService extends MarketService {

  call(method: string, params?: Array<any> | null): Observable<any> {
    let response = {}
    switch (method) {
      case 'proposal':
        response = Responses[method][params[0]];
        break;
      default:
        response = []
    }

    return Observable.of(response);
  }
};
