import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger'

import { IpcService } from '../ipc/ipc.service';

@Injectable()
export class NotificationService {
  constructor(
  ) {
    window.sendNotification = this.sendNotification.bind(this)

  }

  /** Send Notification to the backend */
  public sendNotification(title: string, desc: string) {
    return new Notification(title, {body: desc, icon: './assets/icons/notification.png'});
  }

}
