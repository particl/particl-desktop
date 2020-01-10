import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, mergeMap, repeat, catchError, delay, map } from 'rxjs/operators';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';

import { RpcService } from 'app/core/services/rpc.service';

interface IWallet {
  name: string;
  displayname: string;
}


@Injectable({
  providedIn: 'root'
})
export class MultiwalletService implements OnDestroy {
  private log: any = Log.create(
    'multiwallet.service id:' + Math.floor(Math.random() * 1000 + 1)
  );

  private started: boolean = false;
  private unsubscribe$: Subject<any> = new Subject();

  private POLLING_INTERVAL: number = 5000;  // ms

  constructor(
    private _rpc: RpcService,
    private _store: Store
  ) { }

  start() {
    if (this.started) {
      return;
    }
    this.started = true;
    console.log('@@@@ MULTIWALLETSERVICE STARTED!');
    this.requestAvailableWallets().subscribe(
      (wallets) => {
        console.log('@@@@ MULTIWALLETSERVICE -> got wallets from startup initial request: ', wallets);
        // this._store.dispatch(new Global.UpdateWallets(wallets));
      },
      (error) => {
        this.log.er('listwalletdir fetch failed: ', error);
      },
      () => {
        this.listen();
      }
    );
  }

  /**
   * Listen to the backend for changes in the wallet.dat files
   * New ones added or deleted ones.
   */
  private listen() {
    console.log('@@@@ MULTIWALLETSERVICE -> listen() called');
    of({}).pipe(
      mergeMap(
        () => this.requestAvailableWallets().pipe(
          catchError(e => {
            this.log.er('error fetching wallets: ', e);
            return of((<IWallet[]>[]))
          })
        )
      ),
      delay(this.POLLING_INTERVAL),
      repeat(),
      takeUntil(this.unsubscribe$) // TODO: zaSmilingIdiot 2019-01-09 -> subscription leak here??
    ).subscribe(
      (wallets) => {
        console.log('@@@@ MULTIWALLETSERVICE -> got wallets from listen(): ', wallets);
        if (wallets.length) {
          // this._store.dispatch(new Global.UpdateWallets(wallets));
        }
      }
    );
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  private requestAvailableWallets(): Observable<IWallet[]> {
    console.log('@@@@ Multiwallet service: request to RPC called');
    return this._rpc.call('', 'listwalletdir', [])
      .pipe(
        map((response: any) => {
          response.wallets.forEach(wallet => {
            wallet.displayname = !wallet.name ? 'Default Wallet' : wallet.name;
          });
          return _.orderBy(response.wallets, 'name', 'asc');
        }),

        map((wallets: IWallet[]) => {
          const filteredWallets = wallets.filter(
            (w: IWallet) => {
              const wName = w.name.toLowerCase();
              return !(wName.startsWith('testnet/') || wName.startsWith('testnet\\') || (wName === 'testnet') );
            }
          );
          return filteredWallets;
        })
      );
  }
}
