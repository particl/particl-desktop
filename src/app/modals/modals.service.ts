import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { StatusService } from '../core/status/status.service';

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
  private _statusService: StatusService;

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
    injector: Injector
  ) {
    this._statusService = injector.get(StatusService);
    this._statusService.statusUpdates.asObservable().subscribe(status => {
      this.progress.next(status.syncPercentage);
    });
  }

  open(modal: string): void {
    if (modal in this.messages) {
      this.modal = this.messages[modal];
      this.message.next(this.messages[modal]);
    } else {
      console.error(`modal ${modal} doesn't exist`);
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
}
