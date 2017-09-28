import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Log } from 'ng2-logger';

import { BlockStatusService } from '../core/rpc/rpc.module';
import { RPCService } from '../core/rpc/rpc.module';

import { CreateWalletComponent } from './createwallet/createwallet.component';
import { DaemonComponent } from './daemon/daemon.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { EncryptwalletComponent } from './encryptwallet/encryptwallet.component';

@Injectable()
export class ModalsService {

  public modal: any = null;
  private message: Subject<any> = new Subject<any>();
  private progress: Subject<Number> = new Subject<Number>();

  public enableClose: boolean = true;

  private isOpen: boolean = false;
  private manuallyClosed: any[] = [];

  // Is true if user already has a wallet (imported seed or created wallet)
  private initializedWallet: boolean = false;

  private data: string;

  private log: any = Log.create('modals.service');

  messages: Object = {
    createWallet: CreateWalletComponent,
    daemon: DaemonComponent,
    syncing: SyncingComponent,
    unlock: UnlockwalletComponent,
    encrypt: EncryptwalletComponent
  };

  constructor (
    private _blockStatusService: BlockStatusService,
    private _rpcService: RPCService
  ) {

    // open syncing modal
    this._blockStatusService.statusUpdates.asObservable().subscribe(status => {
      this.progress.next(status.syncPercentage);
      this.openSyncModal(status);
    });

    // open daemon model on error
    this._rpcService.modalUpdates.asObservable().subscribe(status => {
      if (status.error) {
        this.open('daemon', status);
        // no error and daemon model open -> close it
      } else if (this.wasAlreadyOpen('daemon')) {
        this.close();
      } else if (!this.initializedWallet) {
        this.openInitialCreateWallet();
      }
    });
  }

  open(modal: string, data?: any): void {
    if (modal in this.messages) {
      if (
        (data && data.forceOpen)
        || !this.wasManuallyClosed(modal)
      ) {
        if (!this.wasAlreadyOpen(modal)) {
          this.log.d(`next modal: ${modal}`);
          this.modal = this.messages[modal];
          this.message.next({modal: this.modal, data: data});
          this.isOpen = true;
        }
      }
    } else {
      this.log.er(`modal ${modal} doesn't exist`);
    }
  }

  close() {
    this.isOpen = false;
    this.modal = undefined;
    if (!!this.modal && !this.wasManuallyClosed(this.modal)) {

      this.manuallyClosed.push(this.modal.name);
    }
  }

  wasManuallyClosed(modal: any) {
    return this.manuallyClosed.includes(modal.name);
  }

  getMessage() {
      return (this.message.asObservable());
  }

  wasAlreadyOpen(modalName: string) {
    return (this.modal === this.messages[modalName]);
  }


  /* DATA functions */

  storeData(data: any) {
    this.data = data;
  }

  getData() {
    const data: any = this.data;
    this.data = undefined;
    return (data);
   }




  /*  MODAL SPECIFIC FUNCTIONS  */

  // Blockstatus
  getProgress() {
    return (this.progress.asObservable());
  }

  openSyncModal(status: any) {
    // Open syncing Modal
    if (!this.isOpen && (status.networkBH <= 0
      || status.internalBH <= 0
      || status.networkBH - status.internalBH > 50)) {
        this.open('syncing');
    }
  }


  // createwallet
  openInitialCreateWallet() {
    this.log.d(`openInitialCreateWallet()`);
    this._rpcService.call('extkey', ['list'])
      .subscribe(
        response => {
          // check if account is active
          if (response['result'] === 'No keys to list.') {
            this.open('createWallet', {forceOpen: true});

          } else {
            this.log.d(`Already has imported their keys!`);
            this.initializedWallet = true;
          }

        },
        error => {
          // maybe wallet is locked?
          this.log.er('RPC Call returned an error', error);
        });
  }

}
