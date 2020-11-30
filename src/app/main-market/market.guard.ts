import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { MarketState } from './store/market.state';
import { StartedStatus } from './store/market.models';


@Injectable()
export class MarketStartGuard implements CanActivate {

  private readonly loadingPath: string = '/main/market/loading';


  constructor(
    private _router: Router,
    private _store: Store
  ) {}


  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const startedStatus = this._store.selectSnapshot(MarketState.startedStatus);

    // NB! Prevent the infinite loop navigating to the loading component
    if (!state.url.includes(this.loadingPath)) {
      if (startedStatus !== StartedStatus.STARTED) {
        return this._router.navigate([this.loadingPath], { queryParams: { redirectpath: state.url }, queryParamsHandling: 'merge' });
      }
    }

    return true;
  }
}
