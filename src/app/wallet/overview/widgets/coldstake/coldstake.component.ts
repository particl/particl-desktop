import { Component, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcService } from '../../../../core/rpc/rpc.module';
import { ModalsService } from '../../../../modals/modals.service';

import { Amount } from '../../../shared/util/utils';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent implements OnInit {

  /*  General   */
  private log: any = Log.create('coldstake.component');
  coldStakingEnabled: boolean = undefined;
  stakingTowardsCold: boolean = undefined;
  activation: string = 'Activation in progress';
  public encryptionStatus: string = 'Locked';
  private progress: Amount = new Amount(0, 2);
  get coldstakeProgress(): number { return this.progress.getAmount() }

  constructor(
    private _modals: ModalsService,
    private _rpc: RpcService
  ) {

    this._rpc.state.observe('encryptionstatus')
      .subscribe(status => this.encryptionStatus = status);

    this._rpc.state.observe('ui:coldstaking')
    .subscribe(status => this.coldStakingEnabled = status);

    this._rpc.state.observe('ui:coldstaking:stake')
    .subscribe(status => this.stakingTowardsCold = status);

    this.rpc_progressLoop();
  }

  ngOnInit() {
  }

  /** calls getcoldstakinginfo, then calculate progress. */
  private rpc_progressLoop(): void {

    this._rpc.call('getcoldstakinginfo').subscribe((coldstakinginfo: any) => {
        this.log.d(coldstakinginfo['percent_in_coldstakeable_script']);
        this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);
      }, error => this.log.er('couldn\'t get cold staking info', error));

    setTimeout(this.rpc_progressLoop.bind(this), 1000);
    if (this.coldstakeProgress === 100) {
      this.activation = 'Activated';
    }
  }

  openUnlockWalletModal(): void {
    this._modals.open('unlock', {forceOpen: true, showStakeOnly: false, stakeOnly: true});
  }

  openColdStakeModal(): void {
    this._modals.open('coldStake', {forceOpen: true, type: 'cold'});
  }

  checkStatus(): boolean {
    return [
      'Unlocked',
      'Unlocked, staking only',
      'Unencrypted'
    ].includes(this.encryptionStatus);
  }
}
