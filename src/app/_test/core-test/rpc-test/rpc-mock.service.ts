import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { mockgetpeerinfo, mockBlockCount } from './mock-data/getpeerinfo.mock';
import { filterAddress } from './mock-data/filteraddress.mock';
import { filterTxs } from './mock-data/transactions.mock';
import { mockSendInfo, listStealth } from './mock-data/send.mock';

// TODO: create & move into the testing module
// TODO: add more calls, currently only used in SendComponent

@Injectable()
export class RpcMockService {

  constructor() { }

  call(method: string, params?: Array<any> | null): Observable<any> {
    // Switching for different methods and return response accordngly.
    let json = {};
    switch (method) {
      case 'filtertransactions':
        json = filterTxs;
        break;
      case 'filteraddresses':
        if (params.length > 1) {
          json = filterAddress['addresses'];
        } else {
          json = filterAddress['addresscount'];
        }
        break;
      case 'getpeerinfo':
        json = mockgetpeerinfo;
        break;
      case 'getblockcount':
        json = mockBlockCount;
        break;
      case 'sendtypeto':
        json = mockSendInfo;
        break;
      case 'liststealthaddresses':
        json = listStealth;
        break;
      default:
        break;
    }
    return Observable.of(json);
  }

}
