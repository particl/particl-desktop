import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger';
import { HttpClient } from '@angular/common/http';
import * as _ from 'lodash';
import { RpcService } from 'app/core/rpc/rpc.service';

export interface IWallet {
  name: string;
  displayname: string;
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

  constructor(private _rpc: RpcService) {
    this.listen();
  }

  /**
   * Listen to the backend for changes in the wallet.dat files
   * New ones added or deleted ones.
   */
  private listen() {
    this.timer.takeWhile(() => !this.destroyed).subscribe(() => {
      this._rpc.call('listwalletdir', [])
        .map((response: any) => {
          response.wallets.forEach(wallet => {
            wallet.displayname = !wallet.name ? 'Default Wallet' : wallet.name;
          });
          return response.wallets;
        })
        .subscribe(
          (wallets: IWallet[]) => this._list.next(wallets),
          error => this.log.er('listwalletdir: ', error))
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
