import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Log } from 'ng2-logger';

import { RpcStateService, BlockStatusService } from '../core/core.module';

import { MatDialog } from '@angular/material';
import { ModalsHelperService } from 'app/modals/modals-helper.service';

@Injectable()
export class ModalsService implements OnDestroy {

  private progress: Subject<Number> = new Subject<Number>();

  public enableClose: boolean = true;

  /* True if user already has a wallet (imported seed or created wallet) */
  public initializedWallet: boolean = false;
  private destroyed: boolean = false;

  private log: any = Log.create('modals.service');

  constructor (
    private _rpcState: RpcStateService,
    private _blockStatusService: BlockStatusService,
    private _modals: ModalsHelperService
  ) {

    /* Hook BlockStatus -> open syncing modal only once */
    this._blockStatusService.statusUpdates.asObservable().take(1).subscribe(status => {
      this.openSyncModal(status);
    });

    /* Hook BlockStatus -> update % `progress` */
    this._blockStatusService.statusUpdates.asObservable().subscribe(status => {
      this.progress.next(status.syncPercentage);
    });

    /* Hook wallet initialized -> open createwallet modal */
    this.openInitialCreateWallet();

    /* Hook daemon errors -> open daemon modal */
    this._rpcState.errorsStateCall.asObservable()
    .subscribe(
      status => this.log.d('close demaon modal if already open'),
      error => {
          this.enableClose = true;
      });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  /** Get progress set by block status */
  getProgress() {
    return (this.progress.asObservable());
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
        this._modals.syncing();
    }
  }

  /**
    * Open the Createwallet modal if wallet is not initialized
    */
  openInitialCreateWallet(): void {
    this._rpcState.observe('ui:walletInitialized')
      .takeWhile(() => !this.destroyed)
      .subscribe(
        state => {
          this.initializedWallet = state;
          if (state) {
            this.log.i('Wallet already initialized.');
            return;
          }
          this._modals.createWallet();
        });
  }

}
