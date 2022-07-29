import { Injectable } from '@angular/core';
import { BackendService } from 'app/core/services/backend.service';


@Injectable(
  {providedIn: 'root'}
)
@Injectable()
export class CloseGuiService {
  constructor(
    private _backendService: BackendService
  ) {
  }

  /** Quit electron and fired an event to backend */
  public quitElectron() {
    this._backendService.send('gui:gui:close-gui');
  }
}
