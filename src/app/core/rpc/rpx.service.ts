import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// RxIPC related stuffs

declare global {
  interface Window {
    electron: boolean;
    ipc: {
      on: (channel: string, listener: Function) => void;
      once: (channel: string, listener: Function) => void;
      send: (channel: string, arguments?: {}) => void;
      sendSync: (channel: string, arguments?: {}) => void;
      sendToHost: (channel: string, arguments?: {}) => void;
      removeListener: (channel: string, listener: Function) => void;
      removeAllListeners: (channel?: string) => void;
    }
  }
}

@Injectable()
export class RPXService {
  private listenerCount: number = 0;
  listeners: { [id: string]: boolean } = {};

  constructor(public zone: NgZone) { }

  checkRemoteListener(channel: string) {
    return new Promise((resolve, reject) => {
      window.ipc.once('rx-ipc-check-reply:' + channel, (event, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(false);
        }
      });
      window.ipc.send('rx-ipc-check-listener', channel);
    });
  }

  runCommand(channel: string, ...args: any[]): Observable<any> {
    const self = this;
    const subChannel = channel + ':' + this.listenerCount;
    this.listenerCount++;

    window.ipc.send(channel, subChannel, ...args);
    return new Observable((observer) => {
      this.checkRemoteListener(channel)
        .catch((error) => observer.error('Invalid channel: ' + channel + '\nError: ' + error));

      window.ipc.once(subChannel, function listener(event: Event, type: string, data: Object) {
        self.zone.run(() => {
          switch (type) {
            case 'n':
              observer.next(data);
              break;
            case 'e':
              observer.error((<any>data).error ? (<any>data).error : data);
              break;
            case 'c':
              observer.complete();
          }
        });
      });
    });
  }

  runNotification(channel: string, ...args: any[]): Observable<any> {
    window.ipc.send(channel, 'message', ...args);
    return new Observable((observer) => {
      window.ipc.once('message', function listener() {
        observer.complete();
      });
    })
  }

}

