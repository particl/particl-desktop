import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// RxIPC related stuffs

declare global {
  interface Window {
    electron: boolean;
    require: any;
    ipc: {
      once:               (channel:  string, listener:   Function) => void;
      send:               (channel:  string, arguments?: {}      ) => void;
      sendSync:           (channel:  string, arguments?: {}      ) => void;
      sendToHost:         (channel:  string, arguments?: {}      ) => void;
      removeListener:     (channel:  string, listener:   Function) => void;
      removeAllListeners: (channel?: string                      ) => void;
    }
  }
}

@Injectable()
export class IpcService {
  private listenerCount: number = 0;
  listeners: { [id: string]: boolean } = {};

  constructor(
    public zone: NgZone,
  ) {
  }

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

    // @TODO by Kirti: invalid number of arguments, expected 1,2
    window.ipc.send(channel, subChannel, ...args);
    return new Observable((observer) => {

      this.checkRemoteListener(channel)
        .catch(error => observer.error(`Invalid channel: ${channel}\nError: ${error}`));

      window.ipc.once(subChannel, (event: Event, type: string, data: Object) => {
        self.zone.run(() => {
          switch (type) {
            case 'n':
              observer.next(data);
              observer.complete(); // only do this with ipc.once
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

  runNotification(...args: any[]): Observable<any> {
    window.ipc.send('rx-ipc-notification', 'message', ...args);
    return new Observable((observer) => {
      window.ipc.once('message', function listener() {
        observer.complete();
      });
    })
  }

}
