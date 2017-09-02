import { Injectable, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { Observable } from 'rxjs/Observable';

// RxIPC related stuffs

@Injectable()
export class RPXService {
  private listenerCount: number = 0;
  listeners: { [id: string]: boolean } = {};
  constructor(
      public electronService: ElectronService,
      public zone: NgZone
  ) {
  }
  rpxCall() {
   // Respond to checks if a listener is registered
    this.electronService.ipcRenderer.on('rx-ipc-check-listener', (event, channel) => {
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
      this.electronService.ipcRenderer.once('rx-ipc-check-reply:' + channel, (event, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(false);
        }
      });
      this.electronService.ipcRenderer.send('rx-ipc-check-listener', channel);
    });
  }

  runCommand(channel: string, ...args: any[]): Observable<any> {
    const self = this;
    const subChannel = channel + ':' + this.listenerCount;
    this.listenerCount++;
    const target = this.electronService.ipcRenderer;
    target.send(channel, subChannel, ...args);
    return new Observable((observer) => {
      this.checkRemoteListener(channel)
        .catch(() => {
          observer.error('Invalid channel: ' + channel);
        });
      this.electronService.ipcRenderer
        .on(subChannel, function listener(event: Event, type: string, data: Object) {
        switch (type) {
          case 'n':
            self.zone.run(() => {
              observer.next(data);
            })
            break;
          case 'e':
            self.zone.run(() => {
              observer.error(data);
            })
            break;
          case 'c':
            observer.complete();
        }
        // Cleanup
        return () => {
          self.electronService.ipcRenderer.removeListener(subChannel, listener);
        };
      });
    });
  }

}

