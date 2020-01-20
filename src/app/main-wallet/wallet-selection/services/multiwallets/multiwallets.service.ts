import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, Subject, of, forkJoin, throwError } from 'rxjs';
import { catchError, map, retryWhen, tap } from 'rxjs/operators';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';

import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { AppSettingsState } from 'app/core/store/appsettings.state';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { IWallet } from '../../models/wallet-selection.models';


interface IWalletModel {
  name: string;
}


interface IWalletCollectionModel {
  wallets: IWalletModel[]
}


@Injectable({
  providedIn: 'root'
})
export class MultiwalletService implements OnDestroy {
  private log: any = Log.create(
    'multiwallet.service id:' + Math.floor(Math.random() * 1000 + 1)
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
        loadedWallets: this.createListener('listwallets') as Observable<string[]>,
        walletList: this.createListener('listwalletdir') as Observable<IWalletCollectionModel>,
        activeWallet: this._store.selectOnce(AppSettingsState.activeWallet)
      }
    ).pipe(
      tap( ({loadedWallets, walletList, activeWallet}) => {
        if ([loadedWallets, walletList, activeWallet].includes(null)) {
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


  loadWallet(wallet: IWallet) {
    // TODO: CHECK IF WALLET IS LOADED AND PERFORM LOAD IF NECESSARY
    if (wallet.isLoaded) {
      return throwError(false);
    }
    return throwError(false);
    // return this.createListener('loadwallet', [])
  }


  private createListener(method: string, params?: any): Observable<any> {
    return this._rpc.call(method, params).pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 5})),
      catchError(error => of(null))
    )
  }
}
