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
        this.log.d(coldstakinginfo['percent_in_coldstakeable_script']);
        this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);
      }, error => this.log.er('couldn\'t get cold staking info', error));
    }

      /*
    if (this.coldStakingEnabled) {
      this._rpc.call('listunspent')
        .subscribe(
          (response: Array<any>) => {
            let activeCount = 0;
            let totalCount = 0;

            response.forEach((output) => {
              totalCount += output.amount;

              if (output.coldstaking_address !== undefined) {
                activeCount += output.amount;
              }
              this.log.d(`activeCount=${activeCount} totalCount=${totalCount}`);
              this.progress = new Amount((activeCount / totalCount) * 100, 2);
           });
         },
      // TODO: Handle error appropriately
      error => this.log.er('rpc_progressLoop: listunspent failed', error));
    }
      */

    setTimeout(this.rpc_progressLoop.bind(this), 1000);
  }

  openZapWalletsettingsModal(): void {

    /* TODO: use async / await, make return value useful, subscribe errors */
    this.log.d('zap called !');

    this._rpc.call('walletsettings', ['changeaddress']).subscribe(info => {

      this.log.d('zap walletsettings', info);
      const pkey = info.changeaddress.coldstakingaddress;
      if (pkey === 'default') {
        return false;
      }

      this._rpc.call('deriverangekeys', [1, 1, pkey]).subscribe(info => {

        this.log.d('zap deriverangekeys', info);
        if (!info || info.length !== 1) {
          return false;
        }
        const stake = info[0];

        this._rpc.call('getnewaddress', ['""', 'false', 'false', 'true'])
          .subscribe(info => {

            this.log.d('zap getnewaddress', info);
            const spend = info;
            if (!spend || spend === '') {
              return false;
            }

            this._rpc.call('buildscript', [{
              recipe: 'ifcoinstake',
              addrstake: stake,
              addrspend: spend
            }]).subscribe(info => {

              this.log.d('zap buildscript', info);
              if (!info || !info.hex) {
                return false;
              }
              const script = info.hex;

              this._rpc.call('listunspent').subscribe(info => {

                let sum_inputs = 0;
                const inputs = [];

                info.map(utxo => {
                  this.log.d('listunspent utxo', utxo);
                  sum_inputs += utxo.amount;
                  inputs.push({tx: utxo.txid, n: utxo.vout});
                });

                this.log.d('zap params', sum_inputs, inputs);

                this._rpc.call('sendtypeto', ['part', 'part', [{
                  subfee: true,
                  address: 'script',
                  amount: sum_inputs,
                  script: script
                }], '', '', 4, 64, true, JSON.stringify({
                  inputs: inputs
                })]).subscribe(_info => {

                  this.log.d('zap sendtypeto simulate', _info);

                  const dialogRef = this.dialog.open(ZapWalletsettingsComponent);
                  dialogRef.componentInstance.fee = _info.fee;
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
