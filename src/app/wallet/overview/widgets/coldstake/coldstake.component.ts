import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { ModalsService } from 'app/modals/modals.service';
import { RpcService } from 'app/core/rpc/rpc.module';

import { Amount } from '../../../shared/util/utils';
import { ZapColdstakingComponent } from './zap-coldstaking/zap-coldstaking.component';
import {RevertColdstakingComponent} from './revert-coldstaking/revert-coldstaking.component';

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
    private dialog: MatDialog,
    private _modals: ModalsService,
    private _rpc: RpcService
  ) {
    this._rpc.state.observe('ui:coldstaking')
    .subscribe(status => this.coldStakingEnabled = status);

    this._rpc.state.observe('ui:coldstaking:stake')
    .subscribe(status => this.stakingTowardsCold = this.coldStakingEnabled && status);

    // TODO: move to coldstaking service
    this.rpc_progressLoop();
  }

  private rpc_progressLoop(): void {

    if (this.coldStakingEnabled) {
      this._rpc.call('getcoldstakinginfo').subscribe(coldstakinginfo => {
        this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);
      }, error => this.log.er('couldn\'t get cold staking info', error));
      this.stakingStatus();
    }
    // TODO: not necessary when disabled
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

        if (utxo.coldstaking_address) { /* found a cold staking utxo */

          let txAlreadyRecorded = false;

          this.coldstaking.txs.map(tx => {
            if (tx.address === utxo.address) {
              txAlreadyRecorded = true;
              tx.amount += utxo.amount;
              tx.inputs.push({ tx: utxo.txid, n: utxo.vout });
            }
          });

          if (!txAlreadyRecorded) {
            this.coldstaking.txs.push({
              address: utxo.address,
              amount: utxo.amount,
              inputs: [{ tx: utxo.txid, n: utxo.vout }]
            });
          }

        } else { /* found a hot staking utxo */
          this.hotstaking.amount += utxo.amount;
          this.hotstaking.txs.push({ tx: utxo.txid, n: utxo.vout });
        }

      });

      this.log.d('hotstaking', this.hotstaking);
      this.log.d('coldstaking', this.coldstaking);

    }, error => this.log.er('couldn\'t list unspent outputs', error));

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
    dialogRef.componentInstance.utxos = this.coldstaking;
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
    dialogRef.componentInstance.utxos = this.hotstaking;
  }

  openUnlockWalletModal(): void {
    this._modals.open('unlock', { forceOpen: true });
  }

  openColdStakeModal(): void {
    this._modals.open('coldStake', { forceOpen: true, type: 'cold' });
  }
}
