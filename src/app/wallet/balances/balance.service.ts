import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs/Observable';
// import { Observer } from 'rxjs/Observer';
import { Observable, Observer } from 'rxjs'; // use this for testing atm

import { RPCService } from '../../core/rpc/rpc.service';

export class Balances {
  getTotal() {
    return this._total;
  }
  getPublic() {
    return this._public;
  }

  getBlind() {
    return this._blind;
  }

  getPrivate() {
    return this._private;
  }
  getStake() {
    return this._stake;
  }

  getBalance(type: string) {
    if (type === 'TOTAL') {
      return this.getTotal();
    } else if (type === 'PUBLIC') {
      return this.getPublic();
    } else if (type === 'PRIVATE') {
      return this.getPrivate();
    } else if (type === 'BLIND') {
      return this.getBlind();
    } else if (type === 'STAKE') {
      return this.getStake();
    }
  }

  constructor(private _total: number, private _public: number, private _blind: number,  private _private: number,
    private _stake: number) { }
}

@Injectable()
export class BalanceService {

  TEST_BALANCES_JSON: Object[] = [{
    'walletversion': 60000,
    'total_balance': 35611.69395286,
    'balance': 0.12620448,
    'blind_balance': 50.00000000,
    'anon_balance': 0.00000000,
    'staked_balance': 31010.42285840,
    'unconfirmed_balance': 4551.14488998,
    'immature_balance': 0.00000000,
    'txcount': 10,
    'keypoololdest': 1497784835,
    'keypoolsize': 0,
    'reserve': 0.00000000,
    'encryptionstatus': 'Unencrypted',
    'paytxfee': 0.00000000
  },
  {
    'walletversion': 60000,
    'total_balance': 123000.00000009,
    'balance': 123000.00000000,
    'blind_balance': 0.90000000,
    'anon_balance': 123000.9,
    'staked_balance': 123000.458664999,
    'unconfirmed_balance': 4551.14488998,
    'immature_balance': 0.00000000,
    'txcount': 10,
    'keypoololdest': 1497784835,
    'keypoolsize': 0,
    'reserve': 0.00000000,
    'encryptionstatus': 'Unencrypted',
    'paytxfee': 0.00000000
  }];

  private _balances: Observable<Balances>;
  private _observer: Observer<Balances>;

  constructor(private _rpc: RPCService) {
        // we only need to initialize this once, as it is a shared observable...
    this._balances = Observable.create(observer => this._observer = observer).publishReplay(1).refCount();
    this._balances.subscribe().unsubscribe(); // Kick it off, since its shared... We should look at a more functional approach in the future

    this._rpc.register(this, 'getwalletinfo', null, this.rpc_loadBalance, 'both');
    // setTimeout(_ => this.rpc_loadBalance(this.TEST_BALANCES_JSON[1])); // load initial balances
    // just a test
    // setTimeout(_ => this.updateBalanceTest(), 5000);
  }

  getBalances(): Observable<Balances> {
    return this._balances;
  }

  updateBalanceTest(): void {
    this.rpc_loadBalance(this.TEST_BALANCES_JSON[0]);
  }
  /*


  _____  _____   _____
 |  __ \|  __ \ / ____|
 | |__) | |__) | |
 |  _  /|  ___/| |
 | | \ \| |    | |____
 |_|  \_\_|     \_____|


*/

/*
  Load balances over RPC.

*/
  rpc_loadBalance(JSON: Object): void {
      // test values
      const balances: Balances = this.deserialize(JSON);
      this._observer.next(balances);
  }

  rpc_getParameters() {
    return ('');
  }
/*


  _____ _____ _____ _   _          _
 / ____|_   _/ ____| \ | |   /\   | |
| (___   | || |  __|  \| |  /  \  | |
 \___ \  | || | |_ | . ` | / /\ \ | |
 ____) |_| || |__| | |\  |/ ____ \| |____
|_____/|_____\_____|_| \_/_/    \_\______|



*/

  register_newBalanceService(/* RPC-service */): void {
    /*
      This function registers this balance service instance with the CENTRALIZED RPC-service which in turn will
      call all the signals when it receives updates.
      A central RPC-service is required for a good design, we want to maintain one connection to the RPC and
      not spawn a new one for each BalanceService.
    */
    // register(instance: Injectable, apiName: String, signture: Array<any>, callback: Function, when: Array<String>)
    // rpc.register(this, getwalletinfo, [""], this.rpc_loadBalance(), ["ON_NEW_TX"]);
  }

  signal_updateBalance(): void {
    /*
      When a new transaction arrives, we must update the balance. Might be worth ignoring this on IBD.
    */
  }



  /*
    Deserialize JSON and cast it to a class of "type".
  */

  deserialize(json: Object): Balances {
    const total_balance = json['total_balance'];
    const public_balance = json['balance'];
    const blind_balance = json['blind_balance'];
    const private_balance = json['anon_balance'];
    const staked_balance = json['staked_balance'];
    return new Balances(total_balance, public_balance, blind_balance, private_balance, staked_balance);
  }



}
