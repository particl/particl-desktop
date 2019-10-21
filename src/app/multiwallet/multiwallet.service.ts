import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable, interval } from 'rxjs';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';
import { distinctUntilChanged, map, takeWhile, take } from 'rxjs/operators';
import { RpcService } from 'app/core/rpc/rpc.service';

import * as marketConfig from '../../../modules/market/config.js';

export interface IWallet {
  name: string;
  displayname: string;
  isMarketEnabled?: boolean;
}

@Injectable()
export class MultiwalletService implements OnDestroy {
  log: any = Log.create(
    'multiwallet.service id:' + Math.floor(Math.random() * 1000 + 1)
  );
  private destroyed: boolean = false;
  private hasList: boolean = false;

  private timer: any = interval(1000);
  private _list: BehaviorSubject<Array<IWallet>> = new BehaviorSubject([]);

  constructor(
    private _rpc: RpcService) {
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
    this.timer.pipe(takeWhile(() => this.destroyed ? false : !this.hasList)).subscribe(() => {
      if (this._rpc.enabled) {
        this.findAvailableWallets();
      }
    });
  }

  get initComplete(): boolean {
    return this.hasList;
  }

  refreshWalletList() {
    if (this.hasList && !this.destroyed) {
      this.findAvailableWallets();
    }
  }

  /**
   * Returns a list of available wallets on the system.
   */
  get list(): Observable<Array<IWallet>> {
    return this._list
      .asObservable()
      .pipe(
        takeWhile(() => !this.destroyed),
        distinctUntilChanged((x, y: any) => _.isEqual(x, y))); // deep compare
  }

  /**
   * Returns one wallet by name.
   */
  get(w: string): Observable<IWallet> {
    return this.list
      .pipe(
        map(wallets => wallets.find(wallet => wallet.name === w)),
        take(1)
      );
  }

  ngOnDestroy() {
    this.destroyed = true;
    this._list.complete();
  }

  private findAvailableWallets() {
    this._rpc.call('listwalletdir', [])
      .pipe(
        map((response: any) => {
          response.wallets.forEach(wallet => {
            wallet.displayname = !wallet.name ? 'Default Wallet' : wallet.name;
            wallet.isMarketEnabled = (marketConfig.allowedWallets || []).find(
              (wname: string) => wname.toLowerCase() === wallet.name.toLowerCase()
            ) !== undefined;
          });
          return _.orderBy(response.wallets, 'name', 'asc');
        })
      )
      .subscribe(
        (wallets: IWallet[]) => {
          const filteredWallets = wallets.filter(
            (w: IWallet) => !(w.name.toLowerCase().startsWith('testnet/'))
          );
          this._list.next(filteredWallets);
          this.hasList = true;
        },
        (error) => this.log.er('listwalletdir: ', error)
      );
  }
}
