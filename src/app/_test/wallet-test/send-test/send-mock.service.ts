import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

const SendService_OBJECT: any = {file: {}};

@Injectable()
export class SendMockService {

  constructor() { }

  public getTransactionFee(): Observable<any> {
    return Observable.of(SendService_OBJECT);
  }

}
