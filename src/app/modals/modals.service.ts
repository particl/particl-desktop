import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { BlockStatusService } from '../core/rpc/rpc.module';

import { FirsttimeComponent } from './firsttime/firsttime.component';
import { ShowpassphraseComponent } from './firsttime/showpassphrase/showpassphrase.component';
import { FinishComponent } from './firsttime/finish/finish.component';
import { GeneratewalletComponent } from './generatewallet/generatewallet.component';
import { RecoverwalletComponent } from './recoverwallet/recoverwallet.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';

@Injectable()
export class ModalsService {

  public modal: any = null;
  private message: Subject<any> = new Subject<any>();
  private progress: Subject<Number> = new Subject<Number>();

  private state: boolean = false;

  private data: string;

  messages: Object = {
    firstTime: FirsttimeComponent,
    showPassphrase: ShowpassphraseComponent,
    finish: FinishComponent,
    generate: GeneratewalletComponent,
    recover: RecoverwalletComponent,
    syncing: SyncingComponent,
    unlock: UnlockwalletComponent
  };

  constructor (
    private _statusService: BlockStatusService
  ) {
    this._statusService.statusUpdates.asObservable().subscribe(status => {
      this.progress.next(status.syncPercentage);
      this.needToOpenModal(status);
    });
  }

  open(modal: string): void {
    if (modal in this.messages) {
      this.modal = this.messages[modal];
      this.message.next(this.messages[modal]);
      this.state = true;
    } else {
      console.error(`modal ${modal} doesn't exist`);
    }
  }

  close(){
    this.state = false;
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

   needToOpenModal(status: any){
    const networkBH = status.networkBH;
    const internalBH = status.internalBH;
    // Open syncing Modal
    if ((networkBH <= 0 || internalBH <= 0 || networkBH - internalBH > 50) && (!this.state)) {
        this.open('syncing');
    }
   }
}
