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
    // register updates to encryptionStatus
    // TODO: Do we need to create a new observable here?
    this._rpc.call(this._method)
      .subscribe(response => {
        this._encryptionStatusState = (<any>response).encryptionstatus;
        // TODO: Model for response
        this._observerEncryptionStatus.next(this._encryptionStatusState);
      });

    // return Observable.create(_observer => observer = _observer);
    return this._encryptionStatus.take(2).skip(1);
  }

  getEncryptionStatus(): Observable<string> {
    return this._encryptionStatus;
  }

  getEncryptionStatusState(): string {
    return this._encryptionStatusState;
  }
}
