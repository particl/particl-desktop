import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

const SendService_OBJECT: any = {file: {}};

@Injectable()
export class SendMockService {

  constructor() { }

  public getTransactionFee(): Observable<any> {
    return of(SendService_OBJECT);
  }

}
