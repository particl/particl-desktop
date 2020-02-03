import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, tap, take } from 'rxjs/operators';
import { WalletInfoState } from 'app/main/store/main.state';
import { WalletInfoStateModel } from 'app/main/store/main.models';
import { environment } from 'environments/environment';
import { MainActions } from 'app/main/store/main.actions';

@Injectable()
export class ActiveWalletGuard implements CanActivate, CanLoad {
  private _firstLoad: boolean = true;

  constructor(private _router: Router, private _store: Store) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.checkWalletCreated().pipe(
      tap((canNavigate) => {
        if (!canNavigate) {
          this._router.navigate(['/main/wallet/create']);
        }
      })
    );
  }


  canLoad(route: Route): Observable<boolean> {
    return this.checkWalletCreated().pipe(
      tap((canNavigate) => {
        if (!canNavigate) {
          this._router.navigate(['/main/wallet/create']);
        }
      })
    );
  }


  private checkWalletCreated(): Observable<boolean> {
    return this._store.select(WalletInfoState).pipe(
      tap(() => {
        if (environment.envName === 'dev' && this._firstLoad) {
          // Only needed for Angular hot-reloading (during dev): force the wallet info to be fetched,
          //  otherwise this request fails and the dev ends up in the 'Create/Restore wallet' flow.
          this._firstLoad = false;
          this._store.dispatch(new MainActions.Initialize(true))
        }
      }),
      filter((info: WalletInfoStateModel) => typeof info.walletname === 'string'),
      map((info: WalletInfoStateModel) => typeof info.hdseedid === 'string' && info.hdseedid.length > 0),
      take(1)
    )
  }
}
