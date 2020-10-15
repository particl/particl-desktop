import { Injectable } from '@angular/core';
import { IpcService } from 'app/core/services/ipc.service';


@Injectable(
  {providedIn: 'root'}
)
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
