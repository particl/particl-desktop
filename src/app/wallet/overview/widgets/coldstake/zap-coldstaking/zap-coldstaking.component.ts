import { Component } from '@angular/core';

import { Log } from 'ng2-logger';

import { RpcService } from '../../../../../core/rpc/rpc.service';

@Component({
  selector: 'app-zap-coldstaking',
  templateUrl: './zap-coldstaking.component.html',
  styleUrls: ['./zap-coldstaking.component.scss']
})
export class ZapColdstakingComponent {

  private log: any = Log.create('zap-coldstaking');

  public fee: number;
  public utxos: any;

  script: string;

  constructor(private _rpc: RpcService) {

    // TODO: move to coldstaking service
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
              this.script = script.hex;

                this._rpc.call('sendtypeto', ['part', 'part', [{
                  subfee: true,
                  address: 'script',
                  amount: this.utxos.amount,
                  script: script.hex
                }], '', '', 4, 64, true, JSON.stringify({
                  inputs: this.utxos.txs
                })]).subscribe(tx => {

                  this.log.d('zap fees', tx);
                  this.fee = tx.fee;

                });

            });
          });
      })
    });
  }

  zap(amount: number, script: any): void {

    this._rpc.call('sendtypeto', ['part', 'part', [{
      subfee: true,
      address: 'script',
      amount: this.utxos.amount,
      script: this.script
    }], 'coldstaking zap', '', 4, 64, false, JSON.stringify({
      inputs: this.utxos.txs
    })]).subscribe(info => {

      this.log.d('zap sendtypeto', info);
      // TODO: flash notification, close modal

    });

  }

}
