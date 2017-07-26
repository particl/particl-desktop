import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
// import { Observer } from 'rxjs/Observer';
import { Observable, Observer } from 'rxjs'; // use this for testing atm

import { RPCService } from '../../core/rpc/rpc.service';
import { Balances } from './balances.model'

@Injectable()
export class BalanceService {

  private _balances: Observable<Balances>;
  private _observer: Observer<Balances>;

  constructor(private _rpc: RPCService) {
        // we only need to initialize this once, as it is a shared observable...
    this._balances = Observable.create(observer => this._observer = observer).publishReplay(1).refCount();
    this._balances.subscribe().unsubscribe(); // Kick it off, since its shared... We should look at a more functional approach in the future

    this._rpc.register(this, 'getwalletinfo', null, this.rpc_loadBalance_success, 'both');

  }

  getBalances(): Observable<Balances> {
    return this._balances;
  }

  /*
    RPC logic
  */

/**
*  Callback that loads balances from json.
*/
  rpc_loadBalance_success(json: Object): void {
      const balances: Balances = new Balances(json['total_balance'], json['balance'], json['blind_balance'],
        json['anon_balance'], json['staked_balance']);
      this._observer.next(balances);
  }

}
