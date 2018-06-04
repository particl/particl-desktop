import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Log } from 'ng2-logger';

import { MatDialog, MatDialogRef } from '@angular/material';
import { Observable } from 'rxjs/Observable';

import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';

import { UnlockwalletComponent } from 'app/modals/unlockwallet/unlockwallet.component';
import { UnlockModalConfig } from './models/unlock.modal.config.interface';
import { ColdstakeComponent } from 'app/modals/coldstake/coldstake.component';
import { SyncingComponent } from 'app/modals/syncing/syncing.component';
import { EncryptwalletComponent } from 'app/modals/encryptwallet/encryptwallet.component';
import { CreateWalletComponent } from 'app/modals/createwallet/createwallet.component';
import { DaemonComponent } from 'app/modals/daemon/daemon.component';

interface ModalsSettings {
  disableClose: boolean;
}

@Injectable()
export class ModalsHelperService implements OnDestroy {

  // @TODO replace ModalsHelperService with ModalsService.
  private isOpen: boolean = false;
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

    /**
    * coldStack
    * @param {string} type       type contains type of the modal.
    */

  coldStake(type: string) {
    const dialogRef = this._dialog.open(ColdstakeComponent, this.modelSettings);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('coldStack modal closed');
    });
  }

  syncing() {
    if (!this.isOpen) {
      const dialogRef = this._dialog.open(SyncingComponent, this.modelSettings);
      this.isOpen = true;
      dialogRef.afterClosed().subscribe(() => {
        this.log.d('syncing modal closed');
        this.isOpen = false;
      });
    }
  }

  createWallet() {
    const dialogRef = this._dialog.open(CreateWalletComponent, this.modelSettings);
    dialogRef.afterClosed().subscribe(() => {
      this.log.d('createWallet modal closed');
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
