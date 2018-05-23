import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger'
import { Observable } from 'rxjs/Observable';

import { IpcService } from '../ipc/ipc.service';
import { UpdaterComponent } from 'app/core/updater/modal/updater.component';


@Injectable()
export class UpdaterService {

  log: any = Log.create('updater.service');
  private UPDATE_CHANNEL: string = 'update';

  modal: MatDialogRef<UpdaterComponent> | null;

  constructor(private _ipc: IpcService,
              private dialog: MatDialog) {
    this.log.d('Registering ipc listener for updater');
    if (window.electron) {
      // Register a listener on the channel "updater" (ipc)
      this._ipc.registerListener(this.UPDATE_CHANNEL, this.updaterListener.bind(this));
    }
   }

  /*
   This is called every incomming message on update channel.
   node -> GUI (and reply back)
  */
   updaterListener(status: any): Observable<any> {

    return Observable.create(observer => {
        // open modal
        if (status.status === 'started') {
          this.log.d('stating modal');
          this.modal = this.dialog.open(UpdaterComponent);
        }

        // update modal
        if (this.modal) {
          this.modal.componentInstance.set(status);
        }

        // complete
        observer.complete();
      });
  }
}
