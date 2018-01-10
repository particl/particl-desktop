import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { RpcService } from '../../../../core/rpc/rpc.module';
import { ModalsService } from '../../../../modals/modals.service';

import { Amount } from '../../../shared/util/utils';
import { ZapColdstakingComponent } from './zap-coldstaking/zap-coldstaking.component';
import {RevertColdstakingComponent} from "./revert-coldstaking/revert-coldstaking.component";

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent {

  private log: any = Log.create('coldstake.component');

  coldStakingEnabled: boolean = undefined;
  stakingTowardsCold: boolean = undefined;

  private progress: Amount = new Amount(0, 2);
  get coldstakeProgress(): number { return this.progress.getAmount() }

  hotstaking: any = {
    txs: [],
    amount: 0
  };

  coldstaking: any = {
    txs: [],
    amount: 0
  };

  constructor(
    private _modals: ModalsService,
    private _rpc: RpcService,
    private dialog: MatDialog
  ) {
    this._rpc.state.observe('ui:coldstaking')
    .subscribe(status => this.coldStakingEnabled = status);

    this._rpc.state.observe('ui:coldstaking:stake')
    .subscribe(status => this.stakingTowardsCold = this.coldStakingEnabled && status);

    this.rpc_progressLoop();
  }

  private rpc_progressLoop(): void {

    if (this.coldStakingEnabled) {
      this._rpc.call('getcoldstakinginfo').subscribe((coldstakinginfo: any) => {
        this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);
      }, error => this.log.er('couldn\'t get cold staking info', error));
      this.stakingStatus();
    }
    setTimeout(this.rpc_progressLoop.bind(this), 1000);
  }

  private stakingStatus() {

    this._rpc.call('listunspent').subscribe(unspent => {

      this.hotstaking = {
        txs: [],
        amount: 0
      };

      this.coldstaking = {
        txs: [],
        amount: 0
      };

      unspent.map(utxo => {
        if (utxo.coldstaking_address) {
          this.log.d('listunspent coldstaking utxo', utxo);
          this.coldstaking.amount += utxo.amount;
          this.coldstaking.txs.push({tx: utxo.txid, n: utxo.vout});
        } else {
          this.log.d('listunspent hotstaking utxo', utxo);
          this.hotstaking.amount += utxo.amount;
          this.hotstaking.txs.push({tx: utxo.txid, n: utxo.vout});
        }
      });

      this.log.d('hotstaking', this.hotstaking);
      this.log.d('coldstaking', this.coldstaking);

    });

  }

  revertColdstaking() {
    this.log.d('undo coldstaking');

    const dialogRef = this.dialog.open(RevertColdstakingComponent);
    this._rpc.call('walletsettings', ['changeaddress', '"{}"']).subscribe(res => {
      this.log.d('coldstaking undo changeaddress', res);
    });
  }

  openZapColdstakingModal(): void {
    const dialogRef = this.dialog.open(ZapColdstakingComponent);
    dialogRef.componentInstance.utxos = this.hotstaking;
  }

  openUnlockWalletModal(): void {
    this._modals.open('unlock', { forceOpen: true });
  }

  openColdStakeModal(): void {
    this._modals.open('coldStake', { forceOpen: true, type: 'cold' });
  }
}
