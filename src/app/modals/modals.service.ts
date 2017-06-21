import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { FirsttimeComponent } from './firsttime/firsttime.component';
import { SyncingComponent } from './syncing/syncing.component';
import { PassphraseComponent } from './passphrase/passphrase.component';
import { RecoverwalletComponent } from './recoverwallet/recoverwallet.component';

export class ModalsService {

  public modal: any = null;
  private message: Subject<any> = new Subject<any>();
  private progress: Subject<Number> = new Subject<Number>();

  messages: Object = {
    firstTime: FirsttimeComponent,
    syncing: SyncingComponent,
    passphrase: PassphraseComponent,
    recover: RecoverwalletComponent
  };

  open(modal: string): void {

    if (['firstTime', 'syncing', 'passphrase', 'recover'].indexOf(modal) !== -1) {
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
}
