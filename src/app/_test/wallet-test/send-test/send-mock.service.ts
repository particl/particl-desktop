import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { mockSendInfo, listStealth } from 'app/_test/core-test/rpc-test/mock-data/send.mock';
import { TransactionBuilder } from 'app/wallet/wallet/send/transaction-builder.model';
const SendService_OBJECT: any = {file: {}};

@Injectable()
export class SendMockService {

  constructor() { }

  public getTransactionFee(): Observable<any> {
    return Observable.of(SendService_OBJECT);
  }

  public sendTransaction(tx: TransactionBuilder): void {
    tx.estimateFeeOnly = false;
    this.send().subscribe(json => {
      const txsId = json.substring(0, 45) + '...';
    })
  }

  public transferBalance(tx: TransactionBuilder): void {
    tx.estimateFeeOnly = false;
    this.getDefaultStealthAddress().take(1).subscribe(stealthAddress => {
      tx.toAddress = stealthAddress;
      this.send().subscribe(json => {
        const txsId = json.substring(0, 45) + '...';
      })
    })
  }

  private send(): Observable<any> {
    return Observable.of(mockSendInfo);
  }

  private getDefaultStealthAddress(): Observable<string> {
    return Observable.of(listStealth);
  }

}
