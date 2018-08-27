import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Log } from 'ng2-logger'

import { IpcService } from '../ipc/ipc.service';

@Injectable()
export class SettingsGuiService {
  constructor(
    private _ipc: IpcService
  ) {
  }

  /** Minimize electron on Close */
  public minimizeElectronOnClose(settings: object) {
    if (window.electron) {
      this._ipc.runCommand('settings-gui', null, settings);
    }
  }

}
