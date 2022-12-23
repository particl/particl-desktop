import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Store } from '@ngxs/store';
import { NetworkInitializationAction } from 'app/networks/network.actions';
import { Particl } from 'app/networks/networks.module';
import { Observable, of, zip } from 'rxjs';
import { map, take } from 'rxjs/operators';


interface NetworkStatusMap {
  [name: string]: Observable<boolean>;
}


@Injectable({
  providedIn: 'root'
})
export class NetworkInitService {

  private networkStartedStatus: NetworkStatusMap = {
    particl: this._store.select(Particl.State.Core.isRunning()),
  };

  private hasNetworksInitialized: boolean = false;

  constructor(
    private _store: Store
  ) { }

  requestInitializeNetworks(): void {
    if (this.hasNetworksInitialized) {
      return;
    }
    this._store.dispatch(new NetworkInitializationAction());
  }


  monitorNetworkStartedStatus(network: keyof NetworkStatusMap): Observable<boolean> {
    if (network in this.networkStartedStatus) {
      return this.networkStartedStatus[network];
    }

    return of(false);
  }


  getRouteActiveStatus(routeSnapshot: ActivatedRouteSnapshot): Observable<boolean> {
    const dependencies: Set<keyof NetworkStatusMap> = new Set();
    let tempRoute = routeSnapshot;

    while (tempRoute) {
      if (tempRoute.data && Array.isArray(tempRoute.data.networkDependencies)) {
        tempRoute.data.networkDependencies.forEach(dep => {
          if (typeof dep === 'string' && dep in this.networkStartedStatus) {
            dependencies.add(dep);
          }
        });
      }
      tempRoute = tempRoute.parent;
    }

    const foundDeps = [...dependencies];

    if (foundDeps.length === 0) {
      return of(true);
    }

    return zip(
      ...foundDeps.map(dep => this.monitorNetworkStartedStatus(dep).pipe(take(1)))
    ).pipe(
      map(results => results.every(res => res === true))
    );
  }

}
