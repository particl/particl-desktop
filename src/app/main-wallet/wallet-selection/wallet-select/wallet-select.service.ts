import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject, of, forkJoin, throwError } from 'rxjs';
import { catchError, map, retryWhen, tap } from 'rxjs/operators';
import { Log } from 'ng2-logger';

import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { IWallet } from './wallet-select.models';
import { WalletInfoState } from 'app/main/store/main.state';


interface IWalletModel {
  name: string;
}

interface IWalletCollectionModel {
  wallets: IWalletModel[]
}


@Injectable()
export class WalletSelectService implements OnDestroy {
  private log: any = Log.create(
    'wallet-select.service id:' + Math.floor(Math.random() * 1000 + 1)
  );

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _rpc: MainRpcService,
    private _store: Store
  ) {
    this.log.d('service created');
  }


  ngOnDestroy() {
    this.log.d('tearing down service');
    this.destroy$.next();
    this.destroy$.complete();
  }


  fetchWalletInfo(): Observable<IWallet[]> {
    return forkJoin(
      {
        loadedWallets: this.createRetryListener('listwallets') as Observable<string[]>,
        walletList: this.createRetryListener('listwalletdir') as Observable<IWalletCollectionModel>,
        activeWallet: this._store.selectOnce(WalletInfoState.getValue('walletname'))
      }
    ).pipe(
      tap( ({loadedWallets, walletList}) => {
        if ([loadedWallets, walletList].includes(null)) {
          throwError('Failed to fetch wallet information');
        }
      }),
      map((values) => {
        const resp: IWallet[] = [];
        values.walletList.wallets.forEach(wallet => {
          const wName = wallet.name.toLowerCase();
          if (!(wName.startsWith('testnet/') || wName.startsWith('testnet\\') || (wName === 'testnet') )) {
            resp.push({
              name: wallet.name,
              displayName: !wallet.name ? 'Default Wallet' : wallet.name,
              isLoaded: values.loadedWallets.includes(wallet.name),
              isSelected: values.activeWallet === wallet.name
            });
          }
        });
        return resp;
      })
    );
  }


  private createRetryListener(method: string, params?: any, maxRetries: number = 5): Observable<any> {
    return this._rpc.call(method, params).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: maxRetries})),
      catchError(error => of(null))
    )
  }
}
