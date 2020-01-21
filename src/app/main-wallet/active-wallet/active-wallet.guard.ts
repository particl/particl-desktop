import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { retryWhen, catchError, map } from 'rxjs/operators';

import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { WalletInfoStateModel } from 'app/main/store/main.models';
import { Store } from '@ngxs/store';
import { MainActions } from 'app/main/store/main.actions';

@Injectable()
export class ActiveWalletGuard implements CanActivate {
  constructor(private _rpc: MainRpcService, private _router: Router, private _store: Store) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkWalletCreated();
  }


  private checkWalletCreated(): Observable<boolean> {
    return this._rpc.call('getwalletinfo').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 2})),
      catchError(error => of({})),
      map((resp: WalletInfoStateModel): boolean => {
        // error occurred fetching data
        if (Object.keys(resp).length <= 0) {
          return false;
        }

        if (resp && ( (typeof resp.hdseedid !== 'string') || resp.hdseedid.length === 0)) {
          this._router.navigate(['/main/wallet/create']);
          return false;
        }

        this._store.dispatch(new MainActions.UpdateWalletInfo(resp));
        return true;
      })
    )
  }
}
