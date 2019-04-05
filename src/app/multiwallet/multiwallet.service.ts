import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable, interval } from 'rxjs';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';
import { distinctUntilChanged, tap, map, takeWhile, take } from 'rxjs/operators';
import { RpcService } from 'app/core/rpc/rpc.service';
import { Router } from '@angular/router';

export interface IWallet {
  name: string;
  fakename: string;
  displayname: string;
  alreadyLoaded?: boolean;
}

@Injectable()
export class MultiwalletService implements OnDestroy {
  log: any = Log.create(
    'multiwallet.service id:' + Math.floor(Math.random() * 1000 + 1)
  );
  private destroyed: boolean = false;

  private timer: any = interval(1000);
  private _list: BehaviorSubject<Array<IWallet>> = new BehaviorSubject([]);

  constructor(
    private _rpc: RpcService,
    private _router: Router) {
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
    this.timer.pipe(takeWhile(() => !this.destroyed)).subscribe(() => {
      this._rpc.call('listwalletdir', [])
        .pipe(
          map((response: any) => {
            if (!_.some(response.wallets, { 'name': this._rpc.wallet })) {
              this._router.navigate(['/loading'], {
                queryParams: { wallet: '' }
              });
            }
            response.wallets.forEach(wallet => {
              wallet.displayname = !wallet.name ? 'Default Wallet' : wallet.name;
            });
            return _.orderBy(response.wallets, 'name', 'asc');
          })
        )
        .subscribe(
          (wallets: IWallet[]) => this._list.next(wallets),
          (error) => this.log.er('listwalletdir: ', error)
        );
    });
  }

  /**
   * Returns a list of available wallets on the system.
   */
  get list(): Observable<Array<IWallet>> {
    return this._list
      .asObservable()
      .pipe(distinctUntilChanged((x, y: any) => _.isEqual(x, y))); // deep compare
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
  }
}
