import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger'
import { Observable } from 'rxjs/Observable';

import { IpcService } from '../ipc/ipc.service';
import { UpdaterComponent } from 'app/core/updater/modal/updater.component';


@Injectable()
export class UpdaterService {

  log: any = Log.create('updater.service');
  private DAEMON_CHANNEL: string = 'daemon';

  modal: MatDialogRef<UpdaterComponent> | null;

  constructor(private _ipc: IpcService,
    private dialog: MatDialog) {
    this.log.d('Registering ipc listener for updater');
    if (window.electron) {
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
    // open modal
    if (status.status === 'started') {
      this.log.d('stating modal');
      this.modal = this.dialog.open(UpdaterComponent, { disableClose: true });
      this.modal.afterClosed().subscribe(() => this.modal = undefined);
    }

    // update modal
    if (this.modal) {
      this.modal.componentInstance.set(status);
    }
  }

  public restart(): Promise<any> {
    const data = {
      type: 'restart'
    };

    return this._ipc.runCommand(this.DAEMON_CHANNEL, null, data).toPromise();
  }
}
