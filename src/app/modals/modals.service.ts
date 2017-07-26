import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Log } from 'ng2-logger'

import { CreateWalletComponent } from './createwallet/createwallet.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';

@Injectable()
export class ModalsService {

  public modal: any = null;
  private message: Subject<any> = new Subject<any>();
  private progress: Subject<Number> = new Subject<Number>();

  private data: string;

  private log: any = Log.create('modals.service');

  messages: Object = {
    createWallet: CreateWalletComponent,
    syncing: SyncingComponent,
    unlock: UnlockwalletComponent
  };

  open(modal: string, data?: any): void {
    if (modal in this.messages) {
      this.log.d(`next modal: ${modal}`);
      this.message.next({modal: this.messages[modal], data: data});
    } else {
      this.log.er(`modal ${modal} doesn't exist`);
    }
  }

  updateProgress(progress: Number): void {
    this.progress.next(progress);
  }

  getMessage() {
      return (this.message.asObservable());
  }

  getProgress() {
      return (this.progress.asObservable());
  }
}
