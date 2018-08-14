import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger';
import { RpcService } from 'app/core/rpc/rpc.service';
import * as _ from 'lodash';

export interface IWallet {
  name: string;
  fakename: string;
  alreadyLoaded?: boolean;
}

@Injectable()
export class MultiwalletService implements OnDestroy {
  log: any = Log.create(
    'multiwallet.service id:' + Math.floor(Math.random() * 1000 + 1)
  );
  private destroyed: boolean = false;

  private timer: any = Observable.interval(1000);
  private _list: BehaviorSubject<Array<IWallet>> = new BehaviorSubject([]);

  constructor(private rpc: RpcService) {
    this.listen();
  }

  /**
   * Listen to the backend for changes in the wallet.dat files
   * New ones added or deleted ones.
   */
  private listen() {
    // http request
    // subscribe to server side stream
    // and load the wallets in _list.
    this.timer.takeWhile(() => !this.destroyed).subscribe(() => {
      this.rpc.call('listwallets').subscribe(
        response => {
          const wallets = response.map(w => ({
            name: w,
            fakename: w.replace('wallet_', '')
          }));
          this._list.next(wallets);
        },
        error => {
          this.log.er(error);
        }
      );
    });
  }

  /**
   * Returns a list of available wallets on the system.
   */
  get list(): Observable<Array<IWallet>> {
    return this._list
      .asObservable()
      .distinctUntilChanged((x, y: any) => _.isEqual(x, y)); // deep compare
  }

  /**
   * Returns one wallet by name.
   */
  get(w: string): Observable<IWallet> {
    return this.list
      .map(wallets => wallets.find(wallet => wallet.name === w))
      .take(1);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
