import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of'

const SendService_OBJECT: any = {file: {}};

@Injectable()
export class SendMockService {

  constructor() { }

  public getTransactionFee(): Observable<any> {
    return of(SendService_OBJECT);
  }

}
