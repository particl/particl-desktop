import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild, Router } from '@angular/router';
import { defer, EMPTY, iif, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { NetworkInitService } from './services/network-init/network-init.service';


@Injectable()
export class MainRoutingGuard implements CanActivateChild {

  constructor(
    private _router: Router,
    private _networkMonitor: NetworkInitService
  ) {}


  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this._networkMonitor.getRouteActiveStatus(route).pipe(
      concatMap(canNavigate => iif(
        () => canNavigate,
        defer(() => of(true)),
        defer(() => {
          this._router.navigate(['/main/extra/welcome']);
          return EMPTY;
        })
      ))
    );
  }

}
