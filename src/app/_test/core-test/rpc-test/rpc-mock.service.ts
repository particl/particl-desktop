import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import mockgetpeerinfo from './mock-data/getpeerinfo.mock';

// TODO: create & move into the testing module
// TODO: add more calls, currently only used in SendComponent

@Injectable()
export class RpcMockService {

  constructor() { }

  call(method: string, params?: Array<any> | null): Observable<any> {
    return Observable.create(observer => {

      if (method === 'getpeerinfo') {
        observer.next(mockgetpeerinfo);
      } else {
        observer.next(true)
      }

      observer.complete();
    });
  }

}
