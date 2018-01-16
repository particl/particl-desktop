import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Log } from 'ng2-logger';

import { ModalsService } from 'app/modals/modals.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

@Component({
  selector: 'app-zap-coldstaking',
  templateUrl: './zap-coldstaking.component.html',
  styleUrls: ['./zap-coldstaking.component.scss']
})
export class ZapColdstakingComponent {

  private log: any = Log.create('zap-coldstaking');

  public utxos: any;
  fee: number;
  script: string;

  constructor(
    private flashNotification: SnackbarService,
    private dialogRef: MatDialogRef<ZapColdstakingComponent>,
    private _modals: ModalsService,
    private _rpc: RpcService
  ) {

    // TODO: move to coldstaking service
    /* TODO: use async / await, make return value useful, subscribe errors */

    this._rpc.call('walletsettings', ['changeaddress']).subscribe(res => {

      this.log.d('pkey', res);
      const pkey = res.changeaddress.coldstakingaddress;
      if (!pkey || pkey === '' || pkey === 'default') {
        return false;
      }

      this._rpc.call('deriverangekeys', [1, 1, pkey]).subscribe(derived => {

        this.log.d('coldstaking address', derived);
        if (!derived || derived.length !== 1) {
          return false;
        }
        const coldstakingAddress = derived[0];

        this._rpc.call('getnewaddress', ['""', 'false', 'false', 'true'])
          .subscribe(spendingAddress => {

            this.log.d('spending address', spendingAddress);
            if (!spendingAddress || spendingAddress === '') {
              return false;
            }

            this._rpc.call('buildscript', [{
              recipe: 'ifcoinstake',
              addrstake: coldstakingAddress,
              addrspend: spendingAddress
            }]).subscribe(script => {

              this.log.d('script', script);
              if (!script || !script.hex) {
                return false;
              }
              this.script = script.hex;

                this._rpc.call('sendtypeto', ['part', 'part', [{
                  subfee: true,
                  address: 'script',
                  amount: this.utxos.amount,
                  script: script.hex
                }], '', '', 4, 64, true, JSON.stringify({
                  inputs: this.utxos.txs
                })]).subscribe(tx => {

                  this.log.d('fees', tx);
                  this.fee = tx.fee;

                });

            });
          });
      })
    }, error => {
      this.log.er('errr');
    });
  }

  zap() {

    this._rpc.call('sendtypeto', ['part', 'part', [{
      subfee: true,
      address: 'script',
      amount: this.utxos.amount,
      script: this.script
    }], 'coldstaking zap', '', 4, 64, false, JSON.stringify({
      inputs: this.utxos.txs
    })]).subscribe(info => {

      this.log.d('zap', info);

      this.dialogRef.close();
      this.flashNotification.open(
        `Succesfully zapped ${this.utxos.amount} PART to cold staking`, 'warn');
    });

  }

}
