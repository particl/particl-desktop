import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { RpcService } from '../../../../core/rpc/rpc.module';
import { ModalsService } from '../../../../modals/modals.service';

import { Amount } from '../../../shared/util/utils';
import { ZapWalletsettingsComponent } from './zap-walletsettings/zap-walletsettings.component';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent {

  /*  General   */
  private log: any = Log.create('coldstake.component');
  coldStakingEnabled: boolean = undefined;
  stakingTowardsCold: boolean = undefined;

  private progress: Amount = new Amount(0, 2);
  get coldstakeProgress(): number { return this.progress.getAmount() }

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
    }
    setTimeout(this.rpc_progressLoop.bind(this), 1000);
  }

  private listHotstaking() {

  }

  openZapWalletsettingsModal(): void {

    /* TODO: use async / await, make return value useful, subscribe errors */

    this._rpc.call('walletsettings', ['changeaddress']).subscribe(res => {

      this.log.d('zap pkey', res);
      const pkey = res.changeaddress.coldstakingaddress;
      if (!pkey || pkey === '' || pkey === 'default') {
        return false;
      }

      this._rpc.call('deriverangekeys', [1, 1, pkey]).subscribe(derived => {

        this.log.d('zap coldstaking address', derived);
        if (!derived || derived.length !== 1) {
          return false;
        }
        const coldstakingAddress = derived[0];

        this._rpc.call('getnewaddress', ['""', 'false', 'false', 'true'])
          .subscribe(spendingAddress => {

            this.log.d('zap spending address', spendingAddress);
            if (!spendingAddress || spendingAddress === '') {
              return false;
            }

            this._rpc.call('buildscript', [{
              recipe: 'ifcoinstake',
              addrstake: coldstakingAddress,
              addrspend: spendingAddress
            }]).subscribe(script => {

              this.log.d('zap buildscript', script);
              if (!script || !script.hex) {
                return false;
              }

              this._rpc.call('listunspent').subscribe(unspent => {

                let sum_inputs = 0;
                const inputs = [];

                unspent.map(utxo => {
                  if (utxo.coldstaking_address === undefined) {
                    this.log.d('listunspent utxo', utxo);
                    sum_inputs += utxo.amount;
                    inputs.push({tx: utxo.txid, n: utxo.vout});
                  }
                });

                this.log.d('zap params', sum_inputs, inputs);

                this._rpc.call('sendtypeto', ['part', 'part', [{
                  subfee: true,
                  address: 'script',
                  amount: sum_inputs,
                  script: script.hex
                }], '', '', 4, 64, true, JSON.stringify({
                  inputs: inputs
                })]).subscribe(tx => {

                  this.log.d('zap fees', tx);
                  const dialogRef = this.dialog.open(ZapWalletsettingsComponent);
                  dialogRef.componentInstance.fee = tx.fee;

                });
              })

            });
          });
      })
    });
  }

  openUnlockWalletModal(): void {
    this._modals.open('unlock', { forceOpen: true });
  }

  openColdStakeModal(): void {
    this._modals.open('coldStake', { forceOpen: true, type: 'cold' });
  }
}
