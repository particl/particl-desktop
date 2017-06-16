import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

  export class Balances {
    private _total: number;
    private _public: number;
    private _private: number;
    private _stake: number;

    getTotal(){
      return this._total;
    }
    getPublic(){
      return this._public;
    }
    getPrivate(){
      return this._private;
    }
    getStake(){
      return this._stake;
    }

    getBalance(type: string){
      if(type === "TOTAL")
        return this._total;
      else if(type === "PUBLIC")
        return this._public;
      else if(type === "PRIVATE")
        return this._private;
      else if(type === "STAKE")
        return this._stake;
    }

    constructor(total: number, pub: number, priv: number, stake: number){ this._total = total; this._public = pub; this._private = priv; this._stake = stake;}
  } 

@Injectable()
export class BalanceService {

  private _balances: Observable<Balances>;
  private _observer: Observer<Balances>;

  constructor() {
        // we only need to initialize this once, as it is a shared observable...
    this._balances = Observable.create(observer => this._observer = observer).publishReplay(1).refCount();
    this._balances.subscribe().unsubscribe(); // Kick it off, since its shared... We should look at a more functional approach in the future
    
  }

  getBalances(): Observable<Balances> { 
    setTimeout(_ => this.rpc_loadBalance());
    return this._balances;
  }

  updateBalanceTest(): void{
     setTimeout(_ => this._observer.next(new Balances(123000.111111119, 123000.9111111, 123000.91337, 123000.80082800)));
    return;
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
  rpc_loadBalance() {
      //test values
      let balances = new Balances(123000.00000009, 123000.90000000, 123000.9, 123000.458664999);
      this._observer.next(balances);
      setTimeout(_ => this.updateBalanceTest(), 5000);
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
  }

  signal_updateBalance(): void {
    /*
      When a new transaction arrives, we must update the balance. Might be worth ignoring this on IBD.
  	*/
  }
}
