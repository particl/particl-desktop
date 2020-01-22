import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { WalletInfoState } from 'app/main/store/main.state';

@Injectable()
export class ActiveWalletGuard implements CanActivate {
  constructor(private _router: Router, private _store: Store) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const walletCreated = this.checkWalletCreated();
    if (!walletCreated) {
      this._router.navigate(['/main/wallet/create']);
    }
    return walletCreated;
  }


  private checkWalletCreated(): boolean {
    const seed = this._store.selectSnapshot(WalletInfoState.getValue('hdseedid'));
    return typeof seed === 'string' && seed.length > 0;
  }
}
