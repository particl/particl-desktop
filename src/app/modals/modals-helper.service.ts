import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Log } from 'ng2-logger';

import { MatDialog, MatDialogRef } from '@angular/material';

import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { BlockStatusService } from 'app/core/rpc/blockstatus/blockstatus.service';
// modals
import { UnlockwalletComponent } from 'app/modals/unlockwallet/unlockwallet.component';
import { UnlockModalConfig } from './models/unlock.modal.config.interface';
import { ListingExpiryConfig } from './models/listingExpiry.modal.config.interface';
import { ColdstakeComponent } from 'app/modals/coldstake/coldstake.component';
import { SyncingComponent } from 'app/modals/syncing/syncing.component';
import { EncryptwalletComponent } from 'app/modals/encryptwallet/encryptwallet.component';
import { ListingExpirationComponent } from 'app/modals/market-listing-expiration/listing-expiration.component';
import { take } from 'rxjs/operators';

interface ModalsSettings {
  disableClose: boolean;
}

@Injectable()
export class ModalsHelperService implements OnDestroy {

  private log: any = Log.create('modals.service');
  private destroyed: boolean = false;

  // @TODO replace ModalsHelperService with ModalsService.
  private progress: Subject<Number> = new Subject<Number>();

  /* True if user already has a wallet (imported seed or created wallet) */
  public initializedWallet: boolean = false;

  private modelSettings: ModalsSettings = {
    disableClose: true
  };

  constructor (
    private _rpcState: RpcStateService,
    private _blockStatusService: BlockStatusService,
    private _dialog: MatDialog
  ) {

    /* Hook BlockStatus -> open syncing modal only once */
    this._blockStatusService.statusUpdates.asObservable().pipe(take(1)).subscribe(status => {
      // Hiding the sync modal initially
      // this.openSyncModal(status);
    });

    /* Hook BlockStatus -> update % `progress` */
    this._blockStatusService.statusUpdates.asObservable().subscribe(status => {
      this.progress.next(status.syncPercentage);
    });

  }

  /**
    * Unlock wallet
    * @param {UnlockModalConfig} data       Optional - data to pass through to the modal.
    */

  unlock(data: UnlockModalConfig, callback?: Function, cancelcallback?: Function, cancelOnSuccess: boolean = true) {
    if (this._rpcState.get('locked')) {
      const dialogRef = this._dialog.open(UnlockwalletComponent, this.modelSettings);
      if (data || callback) {
        dialogRef.componentInstance.setData(data, callback);
      }
      dialogRef.afterClosed().subscribe(() => {
        if (cancelcallback) {
          const isLocked = this._rpcState.get('locked');
          if (isLocked || cancelOnSuccess) {
            cancelcallback();
          }
        }
        this.log.d('unlock modal closed');
      });
    } else if (callback) {
      callback();
    }
  }

    /**
    * coldStack
    * @param {string} type       type contains type of the modal.
    */

  coldStake(type: string) {
    const dialogRef = this._dialog.open(ColdstakeComponent, this.modelSettings);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('coldStack modal closed');
    });
  }

  syncing() {
    const dialogRef = this._dialog.open(SyncingComponent, this.modelSettings);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('syncing modal closed');
    });
  }

  encrypt() {
    const dialogRef = this._dialog.open(EncryptwalletComponent, this.modelSettings);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('encrypt modal closed');
    });
  }

  /**
    * Open the Sync modal if it needs to be opened
    * @param {any} status  Blockchain status
    */
  openSyncModal(status: any): void {
    // Open syncing Modal
    if ((status.networkBH <= 0
      || status.internalBH <= 0
      || status.networkBH - status.internalBH > 50)) {
        this.syncing();
    }
  }

  openListingExpiryModal(data: ListingExpiryConfig, callback: Function): void {
    const dialogRef = this._dialog.open(ListingExpirationComponent, this.modelSettings);
    dialogRef.componentInstance.setData(data, callback);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('listing exiry modal closed');
    });
  }

  /** Get progress set by block status */
  getProgress() {
    return (this.progress.asObservable());
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
