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
      this.needToOpenModal(status);
    });

    //
    this._rpcService.modalUpdates.asObservable().subscribe(status => {
      if (status.error) {
        this.enableClose = true;
        this.open('daemon', status);
      } else if (this.modal === this.messages['daemon']) {
        this.close();
      }
    });
  }

  open(modal: string, data?: any): void {
    if (modal in this.messages) {
      if (
        (data && data.forceOpen)
        || !this.manuallyClosed.includes(this.messages[modal].name)
      ) {
        this.log.d(`next modal: ${modal}`);
        this.modal = this.messages[modal];
        this.message.next({modal: this.modal, data: data});
        this.isOpen = true;
      }
    } else {
      this.log.er(`modal ${modal} doesn't exist`);
    }
  }

  close() {
    this.isOpen = false;
    if (this.modal && !this.manuallyClosed.includes(this.modal.name)) {
      this.manuallyClosed.push(this.modal.name);
    }
  }

  getMessage() {
      return (this.message.asObservable());
  }

  getProgress() {
      return (this.progress.asObservable());
  }

  storeData(data: any) {
    this.data = data;
  }

  getData() {
    const data: any = this.data;
    this.data = undefined;
    return (data);
   }

  needToOpenModal(status: any) {
    // Open syncing Modal
    if (!this.isOpen && (status.networkBH <= 0
      || status.internalBH <= 0
      || status.networkBH - status.internalBH > 50)) {
        this.open('syncing');
    }
  }
}
