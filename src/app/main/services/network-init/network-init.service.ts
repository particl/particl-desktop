import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { NetworkInitializationAction } from 'app/networks/network.actions';


@Injectable({
  providedIn: 'root'
})
export class NetworkInitService {

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

}