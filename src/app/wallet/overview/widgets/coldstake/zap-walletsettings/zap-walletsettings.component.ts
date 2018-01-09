import { Component } from '@angular/core';

import { Log } from 'ng2-logger';

import { RpcService } from '../../../../../core/rpc/rpc.service';

@Component({
  selector: 'app-zap-walletsettings',
  templateUrl: './zap-walletsettings.component.html',
  styleUrls: ['./zap-walletsettings.component.scss']
})
export class ZapWalletsettingsComponent {

  private log: any = Log.create('zap-walletsettings');

  constructor(private _rpc: RpcService) {
  }

  zap() {
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
                /* TODO */
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
                })]).subscribe(info => {

                  this.log.d('zap sendtypeto simulate', info);

                  // TODO: ask user to confirm info.fee in a modal

                  this.confirmZap(sum_inputs, script);

                });
              })

            });
          });
      })
    });
  }

  confirmZap(amount: number, script: any) {
    this._rpc.call('sendtypeto', ['part', 'part', [{
      subfee: true,
      address: 'script',
      amount: amount,
      script: script
    }], '', '', 4, 64, false]).subscribe(info => {

      this.log.d('zap sendtypeto', info);

    });

  }

}
