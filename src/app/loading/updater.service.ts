import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger'
import { Observable, Subject } from 'rxjs';

import { IpcService } from 'app/core/ipc/ipc.service';


@Injectable()
export class UpdaterService {

  log: any = Log.create('updater.service id:' + Math.floor((Math.random() * 1000) + 1));
  private DAEMON_CHANNEL: string = 'daemon';
  public status: Subject<string> = new Subject<string>();

  constructor(private _ipc: IpcService) {
    this.log.d('Registering ipc listener for updater');
    if (window.electron) {
      this.log.d('Registering ipc listener for updater');
      // Register a listener on the channel "updater" (ipc)
      this._ipc.registerListener(this.DAEMON_CHANNEL, this.daemonListener.bind(this));
    }
  }

  /*
   This is called every incomming message on update channel.
   node -> GUI (and reply back)
  */
  daemonListener(status: any): Observable<any> {

    return Observable.create(observer => {

      switch (status.type) {
        case 'update':
          this.update(status.content);
      }

      // complete
      observer.complete();
    });
  }

  update(status: any) {
    if (status.status === 'started') {
      this.status.next('Downloading new daemon...');
    } else if (status.status === 'busy') {
      const statusCalc = Math.trunc((status.transferred / status.total) * 100);
      this.status.next(`Downloading a new daemon...  ${statusCalc.toFixed(0)}%`);
    } else if (['error', 'done'].includes(status.status)) {
      // TODO: Do we need to display indication to the user if an error occurred
      this.status.complete();
    }
  }

  public restart(): Promise<any> {
    return Observable.create(observer => {
      observer.complete(true);
    }).toPromise();
  }
}
