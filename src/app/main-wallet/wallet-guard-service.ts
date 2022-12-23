import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take, concatMap } from 'rxjs/operators';
import { WalletInfoStateModel } from 'app/networks/particl/particl.models';
import { environment } from 'environments/environment';
import { Particl } from 'app/networks/networks.module';

@Injectable()
export class WalletGuardService {
  private _firstLoad: boolean = true;

  constructor(private _store: Store) {}

  isWalletCreated(): Observable<boolean> {
    const obs = this._store.selectOnce<WalletInfoStateModel>(Particl.State.Wallet.Info).pipe(
      take(1),
      map((info) => {
        return typeof info.hdseedid === 'string' && info.hdseedid.length > 0;
      })
    );

    if (environment.envName === 'dev' && this._firstLoad) {
      // Only needed for Angular hot-reloading (during dev): force the wallet info to be fetched,
      //  otherwise this request fails and the dev ends up in the 'Create/Restore wallet' flow instead of the regular wallet.
      this._firstLoad = false;
      return this._store.dispatch(new Particl.Actions.WalletActions.RefreshWalletInfo).pipe(concatMap(() => obs));
    }
    return obs;
  }
}
