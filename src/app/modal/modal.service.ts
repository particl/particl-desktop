import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

import { FirstTimeModalComponent } from './first-time/first-time.modal.component';
import { SyncingModalComponent } from './syncing/syncing.modal.component';

export class ModalService {

  public modal: any = null;
  private message: Subject<any> = new Subject<any>();
  private progress: Subject<Number> = new Subject<Number>();

  messages: Object = {
    firstTime: FirstTimeModalComponent,
    syncing: SyncingModalComponent
  };

  open(modal: String): void {

    switch (modal) {
      case 'firstTime':
        this.message.next(this.messages['firstTime']);
        break;
      case 'syncing':
        this.message.next(this.messages['syncing']);
        break;
      default:
        console.error(`modal ${modal} doesn't exist`);
        return;
    }

    if (!this.modal) {
      this.modal = document.getElementsByTagName('app-modal')[0].firstChild;
    }
    this.modal.classList.remove('app-modal-hide');
    this.modal.classList.add('app-modal-display');
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
