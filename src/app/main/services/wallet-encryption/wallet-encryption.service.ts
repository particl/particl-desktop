import { Injectable, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';
import { Log } from 'ng2-logger';

import { Observable, Subject, of, timer, iif, defer } from 'rxjs';
import { map, tap, concatMap, mapTo, startWith, distinctUntilChanged, switchMap, takeUntil, take, catchError } from 'rxjs/operators';

import { ParticlRpcService, ParticlWalletService, Particl } from 'app/networks/networks.module';
import { RPCResponses } from 'app/networks/particl/particl.models';
import { UnlockwalletModalComponent } from 'app/main/components/unlock-wallet-modal/unlock-wallet-modal.component';
import { EncryptwalletModalComponent } from 'app/main/components/encrypt-wallet-modal/encrypt-wallet-modal.component';
import { UnlockModalConfig } from './wallet-encryption.model';


@Injectable()
export class WalletEncryptionService implements OnDestroy {


  readonly WALLET_UNLOCKED_POLL_INTERVAL: number = 20_000;

  private log: any = Log.create('wallet-encryption-service.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroy$: Subject<void> = new Subject();

  constructor(
    private _store: Store,
    private _dialog: MatDialog,
    private _walletService: ParticlWalletService,
    private _rpc: ParticlRpcService
  ) {
    this.log.d('starting service...');

    // Start a monitor to watch the wallet unlock timer and refresh the wallet info once the unlock timer has expired
    //  (if the wallet is unlocked)
    const unlockUntil$ = this._store.select(Particl.State.Wallet.Info.getValue('unlocked_until')).pipe(
      startWith(0),
      distinctUntilChanged()
    ) as Observable<number>;

    unlockUntil$.pipe(
      switchMap((until: number) => {
        if (+until <= 0 ) {
          return of();
        }

        const remainingSeconds = until - Math.floor( (new Date().getTime()) / 1000) + 0.5;

        if (remainingSeconds <= 0) {
          return of();
        }

        return timer(remainingSeconds * 1000).pipe(
          tap(() => {
            this._store.dispatch(new Particl.Actions.WalletActions.RefreshWalletInfo());
          }),
          // prevent potential inner observable leak
          takeUntil(this.destroy$)
        );
      }),

      takeUntil(this.destroy$)
    ).subscribe();

  }


  ngOnDestroy() {
    this.log.d('terminating service...');
    this.destroy$.next();
    this.destroy$.complete();
  }


  changeCurrentStatus() {
    const currentStatus = <string>this._store.selectSnapshot(Particl.State.Wallet.Info.getValue('encryptionstatus'));

    if (currentStatus === 'Unencrypted') {
      return this.getEncryptWalletModal();
    }

    if (currentStatus === 'Locked') {
      return this.getUnlockModal({showStakingUnlock: true});
    }

    return this._walletService.lockWallet().pipe(
      tap((resp: boolean) => {
        if (resp) {
          this._store.dispatch(new Particl.Actions.WalletActions.RefreshWalletInfo());
        }
      })
    );
  }


  /**
   *
   * Unlocks the current wallet, or the wallet at the path specified.
   * NB!! Assumes that the wallet at the wallet path specified is already loaded (returning false if not loaded)
   *
   * @returns {Observable<boolean>} Indicates whether the wallet is successfully unlocked
   */
  unlock(data: UnlockModalConfig = {}): Observable<boolean> {
    return iif(

      () => data.wallet && data.wallet.length > 0,

      defer(() => this._rpc.call<RPCResponses.GetWalletInfo>('getwalletinfo', undefined, data.wallet).pipe(
        take(1),
        map((resp) => {
          if (
            resp &&
            (Object.prototype.toString.call(resp) === '[object Object]') &&
            (typeof resp.encryptionstatus === 'string')
          ) {
            return resp.encryptionstatus;
          }

          throw new Error('invalid encryption status');
        }),
      )),

      defer(() => of(<string>this._store.selectSnapshot(Particl.State.Wallet.Info.getValue('encryptionstatus'))))

    ).pipe(
      concatMap(currentStatus => {
        if (['Locked', 'Unlocked, staking only'].includes(currentStatus)) {
          return this.getUnlockModal(data);
        }

        if ((currentStatus === 'Unlocked') && data.timeout) {
          const unlockUntil = <number>this._store.selectSnapshot(Particl.State.Wallet.Info.getValue('unlocked_until'));
          const secondsLeft = unlockUntil - Math.floor( (new Date().getTime()) / 1000);

          if (data.timeout > secondsLeft) {
            return this.getUnlockModal(data);
          }
        }

        return of(true);
      }),
      catchError(() => of(false))
    );
  }


  /**
   *
   * @returns {Observable<boolean>} Indicates whether this call succeeded or not:
   *  if the wallet was not encrypted to begin with then the request to lock is ignored but returns true
   *  to indicate that the request completed successfully.
   */
  lock(): Observable<boolean> {
    const currentStatus = <string>this._store.selectSnapshot(Particl.State.Wallet.Info.getValue('encryptionstatus'));

    if (['Unlocked', 'Unlocked, staking only'].includes(currentStatus)) {
      return this._walletService.lockWallet().pipe(
          tap((resp: boolean) => {
            if (resp) {
              this._store.dispatch(new Particl.Actions.WalletActions.RefreshWalletInfo());
            }
          })
        );
    }

    return of(true);
  }


  private getUnlockModal(data: UnlockModalConfig): Observable<boolean> {
    return this._dialog.open(UnlockwalletModalComponent, {
      data,
      disableClose: true
    }).afterClosed().pipe(
      map((timeout: number) => {
        if ((typeof timeout === 'number') && timeout >= (+data.timeout || 1)) {
            return true;
        }
        return false;
      }),

      tap((success: boolean) => {
        if (success) {
          // Remove concatMap request below and uncomment next line if we don't want/need to wait for the refresh status to complete
          // this._store.dispatch(new Particl.Actions.WalletActions.RefreshWalletInfo());
        }
      }),

      concatMap((success) => {
        if (success) {
          if (data.wallet) {
            return of(true);
          }
          return this._store.dispatch(new Particl.Actions.WalletActions.RefreshWalletInfo()).pipe(
            mapTo(true)
          );

        }
        return of(false);
      })
    );
  }


  private getEncryptWalletModal(): Observable<boolean> {
    return this._dialog.open(EncryptwalletModalComponent).afterClosed().pipe(
      map((success: boolean) => {
        if (typeof success === 'boolean') {
            return success;
        }
        return false;
      }),

      tap((success: boolean) => {
        if (success) {
          // Remove concatMap request below and uncomment next line if we don't want/need to wait for the refresh status to complete
          // this._store.dispatch(new Particl.Actions.WalletActions.RefreshWalletInfo());
        }
      }),

      concatMap((success) => {
        if (success) {
          return this._store.dispatch(new Particl.Actions.WalletActions.RefreshWalletInfo()).pipe(
            mapTo(true)
          );
        }
        return of(success);
      })
    );
  }

}
