import { MarketUserActions } from 'app/main-market/store/market.actions';
import { Injectable } from '@angular/core';
import { Observable, iif, defer, of } from 'rxjs';
import { catchError, map, mapTo, concatMap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { MarketRpcService } from '../market-rpc/market-rpc.service';
import { isBasicObjectType, getValueOrDefault } from 'app/main-governance/utils';
import { ProfileSecrets } from './profile.models';
import { RespProfileMnemonic } from '../../shared/market.models';



@Injectable()
export class ProfileService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
  ) {
  }

  fetchActiveProfileSecrets(): Observable<ProfileSecrets> {
    const currentProfile = this._store.selectSnapshot(MarketState.currentProfile);
    return iif(
      () => currentProfile && currentProfile.id > 0,

      defer(() => this._rpc.call('profile', ['memonic', currentProfile.id]).pipe(
        catchError(() => of({})),
        map((response: RespProfileMnemonic) => {
          const secrets: ProfileSecrets = {
            mnemonic: '',
            password: '',
          };

          if (isBasicObjectType(response)) {
            secrets.mnemonic = getValueOrDefault(response.mnemonic, 'string', secrets.mnemonic);
            secrets.password = getValueOrDefault(response.passphrase, 'string', secrets.password);
          }

          return secrets;
        })
      )),

      defer(() => {
        const emptySecrets: ProfileSecrets = {
          mnemonic: '',
          password: '',
        };
        return of(emptySecrets);
      })
    );
  }


  clearSecrets(profileId: number): Observable<boolean> {
    return iif(
      () => +profileId > 0,
      defer(() => this._rpc.call('profile', ['memonic', profileId, true]).pipe(
        mapTo(true),
        concatMap(success => iif(
          () => success,
          defer(() => this._store.dispatch(new MarketUserActions.UpdateCurrentProfileDetails({hasMnemonicSaved: false})).pipe(
            mapTo(true)
          )),
          defer(() => of(false))
        )),
        catchError(() => of(false)),
      )),
      defer(() => of(false))
    );
  }

}
