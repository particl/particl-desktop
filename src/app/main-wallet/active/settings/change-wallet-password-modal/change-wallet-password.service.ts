import { Injectable } from '@angular/core';
import { Observable, throwError, iif, defer } from 'rxjs';
import {  mapTo } from 'rxjs/operators';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';


@Injectable()
export class ChangeWalletPasswordService {

  constructor(
    private _rpc: MainRpcService,
  ) {}


  changeWalletPassphrase(oldPassword: string, newPassword: string): Observable<boolean> {
    return iif(
      () => !!oldPassword && !!newPassword,

      defer(() => this._rpc.call('walletpassphrasechange', [oldPassword, newPassword])).pipe(
        mapTo(true)
      ),

      defer(() => throwError('invalid details'))
    );
  }
}
