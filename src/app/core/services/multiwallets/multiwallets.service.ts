import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Log } from 'ng2-logger';

import { RpcService } from '../rpc.service';
import { CoreErrorModel } from 'app/core/core.models';


interface ILoadWalletModel {
  name: string;
  warning: string;
}


@Injectable({
  providedIn: 'root'
})
export class MultiwalletService implements OnDestroy {
  private log: any = Log.create(
    'multiwallet.service id:' + Math.floor(Math.random() * 1000 + 1)
  );

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _rpc: RpcService
  ) {
    this.log.d('service created');
  }


  ngOnDestroy() {
    this.log.d('tearing down service');
    this.destroy$.next();
    this.destroy$.complete();
  }


  loadWallet(walletName: string): Observable<boolean> {
    return this._rpc.call('', 'loadwallet', [walletName]).pipe(
      catchError((error: CoreErrorModel) => {
        return error && (error.code === -4) ? of({name: walletName, warning: ''} as ILoadWalletModel) : throwError(error);
      }),

      map((resp: ILoadWalletModel) => {
        if ((resp.name === walletName) && (resp.warning === '')) {
          return true;
        }
        return false;
      })
    )
  }
}
