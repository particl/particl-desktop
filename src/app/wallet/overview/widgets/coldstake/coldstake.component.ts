import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';

import { ModalsHelperService } from 'app/modals/modals.module';
import { RpcService, RpcStateService } from 'app/core/rpc/rpc.module';
import { ColdstakeService } from './coldstake.service'

import { Amount } from '../../../../core/util/utils';
import { ZapColdstakingComponent } from './zap-coldstaking/zap-coldstaking.component';
import { RevertColdstakingComponent } from './revert-coldstaking/revert-coldstaking.component';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent {

  private log: any = Log.create('coldstake.component');

  constructor(
    private dialog: MatDialog,
    /***
     *  @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
     */
    private _modals: ModalsHelperService,
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    public coldstake: ColdstakeService
  ) { }

  zap() {
    this._modals.unlock({}, (status) => this.openZapColdstakingModal());
  }

  revert() {
    this._modals.unlock({}, (status) => this.openRevertColdstakingModal());
  }

  openRevertColdstakingModal() {
    const dialogRef = this.dialog.open(RevertColdstakingComponent);
  }

  openZapColdstakingModal(): void {
    const dialogRef = this.dialog.open(ZapColdstakingComponent);
  }

  openUnlockWalletModal(): void {
    this._modals.unlock({ showStakeOnly: false, stakeOnly: true });
  }

  openColdStakeModal(): void {
    this._modals.coldStake('cold');
  }

  checkLockStatus(): boolean {
    return [
      'Unlocked',
      'Unlocked, staking only',
      'Unencrypted'
    ].includes(this.coldstake.encryptionStatus);
  }
}
