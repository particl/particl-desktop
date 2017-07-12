import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { FirsttimeComponent } from './firsttime/firsttime.component';
import { ShowpassphraseComponent } from './firsttime/showpassphrase/showpassphrase.component';
import { ConfirmpassphraseComponent } from './firsttime/confirmpassphrase/confirmpassphrase.component';
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

  private data: string;

  messages: Object = {
    firstTime: FirsttimeComponent,
    showPassphrase: ShowpassphraseComponent,
    confirmPassphrase: ConfirmpassphraseComponent,
    finish: FinishComponent,
    generate: GeneratewalletComponent,
    recover: RecoverwalletComponent,
    syncing: SyncingComponent,
    unlock: UnlockwalletComponent
  };

  open(modal: string): void {
    if (modal in this.messages) {
      this.message.next(this.messages[modal]);
    } else {
      console.error(`modal ${modal} doesn't exist`);
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

  storeData(data: any) {
    this.data = data;
  }

  getData() {
    const data: any = this.data;
    this.data = undefined;
    return (data);
   }
}
