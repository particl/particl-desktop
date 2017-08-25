import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs'; // use this for testing atm

import { RPCService } from './rpc.service';

@Injectable()
export class EncryptionStatusService {
  private _method: string = 'getwalletinfo';
  private _encryptionStatus: Observable<string>;
  private _observerEncryptionStatus: Observer<string>;

  private _encryptionStatusState: string = 'Locked';

  constructor(private _rpc: RPCService) {

    // register updates to encryptionStatus
    this._rpc.register(this, this._method, null, (response: Object) => {
        // TODO: Model for response
      this._observerEncryptionStatus.next((<any>response).encryptionstatus);
      this._encryptionStatusState = (<any>response).encryptionstatus;
    }, 'time');

    this._encryptionStatus = Observable.create(observer => this._observerEncryptionStatus = observer).publishReplay(1).refCount();
    this._encryptionStatus.subscribe().unsubscribe();
  }

  refreshEncryptionStatus(): Observable<string> {
    let observer: Observer<string>;

    // register updates to encryptionStatus
    this._rpc.call(this, this._method, null, (response: Object) => {
      // TODO: Model for response
      observer.next((<any>response).encryptionstatus);
      this._encryptionStatusState = (<any>response).encryptionstatus;
    });


    return Observable.create(_observer => observer = _observer);
  }

  getEncryptionStatus(): Observable<string> {
    return this._encryptionStatus;
  }

  getEncryptionStatusState(): string {
    return this._encryptionStatusState;
  }
}
