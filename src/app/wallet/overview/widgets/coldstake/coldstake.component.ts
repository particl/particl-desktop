import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { ModalsService } from 'app/modals/modals.service';
import { RpcService } from 'app/core/rpc/rpc.module';

import { Amount } from '../../../shared/util/utils';
import { ZapColdstakingComponent } from './zap-coldstaking/zap-coldstaking.component';
import { RevertColdstakingComponent } from './revert-coldstaking/revert-coldstaking.component';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent {

  private log: any = Log.create('coldstake.component');

  coldStakingEnabled: boolean = undefined;
  stakingTowardsCold: boolean = undefined;
  activation: string = 'Activation in progress';
  public encryptionStatus: string = 'Locked';
  private progress: Amount = new Amount(0, 2);
  get coldstakeProgress(): number { return this.progress.getAmount() }

  hotstakingamount: number = 0.0;
  coldstakingamount: number = 0.0;

  constructor(
    private dialog: MatDialog,
    private _modals: ModalsService,
    private _rpc: RpcService
  ) {

    this._rpc.state.observe('encryptionstatus')
      .subscribe(status => this.encryptionStatus = status);

    this._rpc.state.observe('ui:coldstaking')
     .subscribe(status => this.coldStakingEnabled = status);

    this._rpc.state.observe('ui:coldstaking:stake')
    .subscribe(status => this.stakingTowardsCold = status);

    // TODO: move to coldstaking service
    this.rpc_progressLoop();
  }

  private rpc_progressLoop(): void {

    // TODO: not necessary when cold staking disabled

    this._rpc.call('getcoldstakinginfo').subscribe(coldstakinginfo => {
      this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);
    }, error => this.log.er('couldn\'t get cold staking info', error));

    this.stakingStatus();

    setTimeout(this.rpc_progressLoop.bind(this), 5000);
    if (this.coldstakeProgress === 100) {
      this.activation = 'Activated';
    }
  }

  private stakingStatus() {
    this._rpc.call('getcoldstakinginfo').subscribe(coldstakinginfo => {
        this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);
        this.coldstakingamount = coldstakinginfo['percent_in_coldstakeable_script'];
        this.hotstakingamount = coldstakinginfo['coin_in_stakeable_script'];
    }, error => this.log.er('couldn\'t get coldstakinginfo', error));
  }

  zap() {
    if (this._rpc.state.get('locked')) {
      this._modals.open('unlock', {
        forceOpen: true,
        callback: this.openZapColdstakingModal.bind(this)
      });
    } else {
      this.openZapColdstakingModal();
    }
  }

  openRevertColdstakingModal() {
    const dialogRef = this.dialog.open(RevertColdstakingComponent);
  }

  revert() {
    if (this._rpc.state.get('locked')) {
      this._modals.open('unlock', {
        forceOpen: true,
        callback: this.openRevertColdstakingModal.bind(this)
      });
    } else {
      this.openRevertColdstakingModal();
    }
  }

  openZapColdstakingModal(): void {
    const dialogRef = this.dialog.open(ZapColdstakingComponent);
  }

  openUnlockWalletModal(): void {
    this._modals.open('unlock', {forceOpen: true, showStakeOnly: false, stakeOnly: true});
  }

  openColdStakeModal(): void {
    this._modals.open('coldStake', { forceOpen: true, type: 'cold' });
  }

  checkLockStatus(): boolean {
    return ['Unlocked', 'Unlocked, staking only', 'Unencrypted'].includes(this.encryptionStatus);
  }
}
