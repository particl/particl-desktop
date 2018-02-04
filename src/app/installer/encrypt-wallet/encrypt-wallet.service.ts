import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger';

import { RpcService } from 'app/core/rpc/rpc.service';

@Injectable()
export class EncryptWalletService {

  log: any = Log.create('encrypt-wallet.service');

  constructor(
    private rpc: RpcService
  ) { }

  /**
   * Encrypts the wallet.
   */
  encrypt(password: string): Observable<any> {
    return this.rpc.call('encryptwallet', [password]);
  }

  restartDaemon(): Observable<any> {
    return this.rpc.call('restart-daemon');
  }

}
