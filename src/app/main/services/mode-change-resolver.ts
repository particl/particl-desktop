import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, of, EMPTY } from 'rxjs';

import { Global } from 'app/core/store/app.actions';
import { APP_MODE } from 'app/core/store/app.models';

@Injectable({
  providedIn: 'root',
})
export class ModeChangerResolverService implements Resolve<never> {

  constructor(private _store: Store) { }

  resolve(route: ActivatedRouteSnapshot): Observable<never> {

    const segments = route.url;
    if (segments[0].toString() === 'main') {
      switch (segments[1].toString()) {
        case 'wallet':
          this._store.dispatch(new Global.ChangeMode(APP_MODE.WALLET));
          break;

        case 'market':
          this._store.dispatch(new Global.ChangeMode(APP_MODE.MARKET));
          break;
      }
    }

    return EMPTY;
  }

}
