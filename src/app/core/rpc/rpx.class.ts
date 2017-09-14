import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// RxIPC related stuffs

declare global {
  interface Window {
    electron: boolean;
    ipcSend:(channel: string, arguments?: {}) => void;
    ipcOn:(channel: string, listener: Function) => void;
    ipcOnce:(channel: string, listener: Function) => void;
    ipcRemove:(channel: string, listener: Function) => void;
  }
}

@Injectable()
export class RPXService {
  private listenerCount: number = 0;
  listeners: { [id: string]: boolean } = {};

  constructor(
      public zone: NgZone
  ) {
  }

  rpxCall() {
   // Respond to checks if a listener is registered
    window.ipcOn('rx-ipc-check-listener', (event, channel) => {
      const replyChannel = 'rx-ipc-check-reply:' + channel;
      if (this.listeners[channel]) {
        event.sender.send(replyChannel, true);
      } else {
        event.sender.send(replyChannel, false);
      }
    });
  }

  checkRemoteListener(channel: string) {
    return new Promise((resolve, reject) => {
      window.ipcOnce('rx-ipc-check-reply:' + channel, (event, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(false);
        }
      });
      window.ipcSend('rx-ipc-check-listener', channel);
    });
  }

  runCommand(channel: string, ...args: any[]): Observable<any> {
    const self = this;
    const subChannel = channel + ':' + this.listenerCount;
    this.listenerCount++;

    window.ipcSend(channel, subChannel, ...args);
    return new Observable((observer) => {
      this.checkRemoteListener(channel)
        .catch(() => observer.error('Invalid channel: ' + channel));

      window.ipcOn(subChannel, function listener(event: Event, type: string, data: Object) {
        self.zone.run(() => {

          console.log('data', data);
          switch (type) {
            case 'n':
            console.log('data', data);
              observer.next(data);
              break;
            case 'e':
              observer.error(data);
              break;
            case 'c':
              observer.complete();
          }
        })
        // Cleanup
        return () => {
          window.ipcRemove(subChannel, listener);
        };
      });
    });
  }

}

