import { Injectable } from '@angular/core';
import { IpcService } from '../ipc/ipc.service';
// Notification related stuffs

@Injectable()
export class NotificationService {
  constructor(
    private _ipc: IpcService
  ) {
  }
  /** Send Notification to the backend */
  sendNotification(title: string, desc: string) {
    this._ipc.runNotification(title, desc);
  }

}
