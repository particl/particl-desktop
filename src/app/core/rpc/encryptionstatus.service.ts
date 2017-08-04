import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs'; // use this for testing atm

import { RPCService } from './rpc.service';

@Injectable()
export class EncryptionStatusService {

  private _encryptionStatus: Observable<string>;
  private _observerEncryptionStatus: Observer<string>;

  private _encryptionStatusState: string = 'Locked';

  constructor(private _rpc: RPCService) {

    // register updates to encryptionStatus
    this._rpc.register(this, 'getwalletinfo', null, this.setEncryptionStatus, 'time');

    this._encryptionStatus = Observable.create(observer => this._observerEncryptionStatus = observer).publishReplay(1).refCount();
    this._encryptionStatus.subscribe().unsubscribe();
  }

  private setEncryptionStatus(json: Object): void {
    this._observerEncryptionStatus.next(json['encryptionstatus']);
    this._encryptionStatusState = json['encryptionstatus'];
  }

  getEncryptionStatus(): Observable<string> {
    return this._encryptionStatus;
  }

  getEncryptionStatusState(): string {
    return this._encryptionStatusState;
  }
}
