import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from './rpc.responses';
import { of } from 'rxjs'
/*
    This is a fake mock service used for the RpcService.
*/
@Injectable()
export class MockRpcService {

  call(method: string, params?: Array<any> | null): Observable<any> {
    // Switching for different methods and return response accordngly.
    let json = {};
    switch (method) {
      case 'filtertransactions':
        json = Result[method];
        break;
      default:
        break;
    }
    return of(json);
  }
};
