import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { WalletGuardService } from '../wallet-guard-service';


@Injectable()
export class NewWalletGuard implements CanActivate, CanLoad {

  constructor(private _router: Router, private _authService: WalletGuardService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.isNewWallet().pipe(
      tap((isNew) => {
        if (!isNew) {
          this._router.navigate(['/main/wallet/active/overview']);
        }
      })
    );
  }


  canLoad(route: Route): Observable<boolean> {
    return this.isNewWallet().pipe(
      tap((isNew) => {
        if (!isNew) {
          this._router.navigate(['/main/wallet/active/overview']);
        }
      })
    );
  }


  private isNewWallet(): Observable<boolean> {
    return this._authService.isWalletCreated().pipe(map((response) => !response));
  }
}
