import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from 'ng2-logger'

import { IpcService } from '../ipc/ipc.service';

@Injectable()
export class CloseGuiService {
  constructor(
    private _ipc: IpcService
  ) {
  }

  /** Quit electron and fired an event to backend */
  public quitElectron() {
    if (window.electron) {
      this._ipc.runCommand('close-gui', null, null);
    }
  }

}
