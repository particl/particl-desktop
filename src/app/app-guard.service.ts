import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Actions, ofActionCompleted, Store } from '@ngxs/store';
import { GlobalActions } from 'app/core/app-global-state/app.actions';
import { mapTo, take } from 'rxjs/operators';


@Injectable()
export class AppInitRoutingGuard implements CanActivate {


  private isInitialized: boolean = false;


  constructor(
    private _store: Store,
    private _actions: Actions) {}


  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.appIsInitialized();
  }


  private appIsInitialized(): Observable<boolean> {
    if (this.isInitialized) {
      return of(true);
    }

    this.isInitialized = true;
    this._store.dispatch(new GlobalActions.Initialize());
    return this._actions.pipe(ofActionCompleted(GlobalActions.Initialize), take(1), mapTo(true));
  }
}