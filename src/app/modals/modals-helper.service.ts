import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Log } from 'ng2-logger';

import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';

import { UnlockwalletComponent } from 'app/modals/unlockwallet/unlockwallet.component';
import { UnlockModalConfig } from './models/unlock.modal.config.interface';

interface ModalsSettings {
  disableClose: boolean;
}

@Injectable()
export class ModalsHelperService implements OnDestroy {

  // @TODO replace ModalsHelperService with ModalsService.

  private log: any = Log.create('modals.service');
  private destroyed: boolean = false;
  private modelSettings: ModalsSettings = {
    disableClose: true
  };

  constructor (
    private _rpcState: RpcStateService,
    private _dialog: MatDialog
  ) { }

  /**
    * Unlock wallet
    * @param {UnlockModalConfig} data       Optional - data to pass through to the modal.
    */

  unlock(data: UnlockModalConfig, callback?: Function) {
    if (this._rpcState.get('locked')) {
      const dialogRef = this._dialog.open(UnlockwalletComponent, this.modelSettings);
      if (!!data || callback) {
        dialogRef.componentInstance.setData(data, callback);
      }
      dialogRef.afterClosed().subscribe(() => {
        this.log.d('unlock modal closed');
      });
    } else if (!!callback) {
      callback();
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
