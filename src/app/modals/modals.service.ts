import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Log } from 'ng2-logger';

import { RpcService, RpcStateService, BlockStatusService } from '../core/core.module';

/* modals */
import { CreateWalletComponent } from './createwallet/createwallet.component';
import { ColdstakeComponent } from './coldstake/coldstake.component';
import { DaemonComponent } from './daemon/daemon.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { EncryptwalletComponent } from './encryptwallet/encryptwallet.component';
import { MultiwalletComponent } from './multiwallet/multiwallet.component';

import { MatDialog } from '@angular/material';
import { ModalsComponent } from './modals.component';

@Injectable()
export class ModalsService implements OnDestroy {

  public modal: any = null;
  private message: Subject<any> = new Subject<any>();
  private progress: Subject<Number> = new Subject<Number>();

  public enableClose: boolean = true;
  private isOpen: boolean = false;
  private manuallyClosed: any[] = [];

  /* True if user already has a wallet (imported seed or created wallet) */
  public initializedWallet: boolean = false;
  private data: string;
  private destroyed: boolean = false;

  private log: any = Log.create('modals.service');

  messages: Object = {
    createWallet: CreateWalletComponent,
    coldStake: ColdstakeComponent,
    daemon: DaemonComponent,
    syncing: SyncingComponent,
    unlock: UnlockwalletComponent,
    encrypt: EncryptwalletComponent,
    multiwallet: MultiwalletComponent
  };

  constructor (
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private _blockStatusService: BlockStatusService,
    private _dialog: MatDialog
  ) {

    /* Hook BlockStatus -> open syncing modal */
    this._blockStatusService.statusUpdates.asObservable().subscribe(status => {
      this.progress.next(status.syncPercentage);
      this.openSyncModal(status);
    });

    /* Hook wallet initialized -> open createwallet modal */
    this.openInitialCreateWallet();

    /* Hook daemon errors -> open daemon modal */
    this._rpcState.errorsStateCall.asObservable()
    .subscribe(
      status => this.wasAlreadyOpen('daemon') && this.close(),
      error => {
          this.enableClose = true;
          // this.open('daemon', error);
      });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  /**
    * Open a modal
    * @param {string} modal   The name of the modal to open
    * @param {any} data       Optional - data to pass through to the modal.
    */
  open(modal: string, data?: any): void {
    const dialogRef = this._dialog.open(ModalsComponent, {disableClose: true, width: '100%', height: '100%'});
    if (modal in this.messages) {
      if (
        (data && data.forceOpen)
        || !this.wasManuallyClosed(this.messages[modal].name)
      ) {
        if (!this.wasAlreadyOpen(modal)) {
          this.log.d(`next modal: ${modal}`);
          this.modal = this.messages[modal];
          dialogRef.componentInstance.open(this.modal, data);
          // this.message.next({modal: this.modal, data: data});
          this.isOpen = true;
          dialogRef.componentInstance.enableClose = true;
          dialogRef.afterClosed().subscribe(() => {
            this.close();
          });
        } else {
            dialogRef.close();
        }
      }
    } else {
      this.log.er(`modal ${modal} doesn't exist`);
    }
  }

  /** Close the modal */
  close(): void {
    const isOpen = this.isOpen;

    if (!!this.modal && !this.wasManuallyClosed(this.modal.name)) {
      this.manuallyClosed.push(this.modal.name);
    }
    this.isOpen = false;
    this.modal = undefined;

    if (isOpen) {
      this.message.next({close: true});
    }
  }

  /**
    * Check if a modal was manually closed
    * @param {any} modal  The modal to check
    */
  wasManuallyClosed(modal: any): boolean {
    return this.manuallyClosed.includes(modal);
  }

  /** Check if the modal is already open */
  wasAlreadyOpen(modalName: string): boolean {
    return (this.modal === this.messages[modalName]);
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
    if (!this.isOpen && !this.wasManuallyClosed(this.messages['syncing'].name)
      && (status.networkBH <= 0
      || status.internalBH <= 0
      || status.networkBH - status.internalBH > 50)) {
        this.open('syncing');
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
          this.open('createWallet', {forceOpen: true});
        });
  }

}
