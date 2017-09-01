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
    this._balances = Observable.create(observer => {
      this._observer = observer
      this._rpc.chainState
        .subscribe(
          state => {
            if (state.chain) {
              this._observer.next(
                new Balances(
                  state.chain.total_balance,
                  state.chain.balance,
                  state.chain.blind_balance,
                  state.chain.anon_balance,
                  state.chain.staked_balance))
            }
          });
    }).publishReplay(1).refCount();
    this._balances.subscribe().unsubscribe(); // Kick it off, since its shared... We should look at a more functional approach in the future

  }

  getBalances(): Observable<Balances> {
    return this._balances;
  }

}
