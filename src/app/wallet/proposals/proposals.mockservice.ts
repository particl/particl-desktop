import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Responses } from 'app/core/market/mock-data/mock-market.responses';

/*
  This is a fake mock service used for the MockProposalsService.
  so we have to override it in all tests that use the Services/ Components.
*/

@Injectable()
export class MockProposalsService {

  list(method: string, params?: Array<any> | null): Observable<any> {
    const response = Responses['proposal']['list'];
    return Observable.of(response);
  }

  post(options: Array<any> = []) {
    const response = {};
    return Observable.of(response);
  }

  result(proposalHash: string) {
    const response = Responses['vote']['result'][proposalHash];
    return Observable.of(response);
  }

  vote(options: Array<any>) {
    let response = {};
    if (options && options[0] && options[1]) {
      response = Responses['vote'][options[0]][options[1]];
    }
    return Observable.of(response);
  }

  get(proposalHash: string) {
    let response = {}
    response = Responses['vote']['get'][proposalHash];

    if (!response) {
      response = Responses['vote']['get'][404];
    }

    return Observable.of(response);
  }
};
