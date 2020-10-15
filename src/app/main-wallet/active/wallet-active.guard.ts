import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WalletGuardService } from '../wallet-guard-service';


@Injectable()
export class ActiveWalletGuard implements CanActivate, CanLoad, CanActivateChild {

  constructor(private _router: Router, private _authService: WalletGuardService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.isCreatedWallet().pipe(
      tap((isCreated) => {
        if (!isCreated) {
          this._router.navigate(['/main/wallet/create']);
        }
      })
    );
  }


  canLoad(route: Route): Observable<boolean> {
    return this.isCreatedWallet().pipe(
      tap((isCreated) => {
        if (!isCreated) {
          this._router.navigate(['/main/wallet/create']);
        }
      })
    );
  }


  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.canActivate(route, state);
  }


  private isCreatedWallet(): Observable<boolean> {
    return this._authService.isWalletCreated();
  }
}
