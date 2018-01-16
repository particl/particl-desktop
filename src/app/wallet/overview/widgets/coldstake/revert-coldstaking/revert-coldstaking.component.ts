import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Log } from 'ng2-logger';

import { ModalsService } from 'app/modals/modals.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

@Component({
  selector: 'app-revert-coldstaking',
  templateUrl: './revert-coldstaking.component.html',
  styleUrls: ['./revert-coldstaking.component.scss']
})
export class RevertColdstakingComponent implements OnInit {

  private log: any = Log.create('revert-coldstaking');

  public fee: number;
  public utxos: any = {
    txs: [],
    amount: 0
  };

  address: string;

  constructor(
    private flashNotification: SnackbarService,
    private dialogRef: MatDialogRef<RevertColdstakingComponent>,
    private _modals: ModalsService,
    private _rpc: RpcService
  ) { }

  ngOnInit() {
    this._rpc.call('liststealthaddresses', null)
      .subscribe(stealthAddresses => {
            // TODO: make sure a stealth address was created with wallet
            this.address = stealthAddresses[0]['Stealth Addresses'][0]['Address'];
            this.log.d('return address', this.address);

            let sentTXs = 0;
            let totalFee = 0;

            this.utxos.txs.map(tx => {

              this.log.d('revert fee for address', tx);

              this._rpc.call('sendtypeto', ['part', 'part', [{
                subfee: true,
                address: this.address,
                amount: tx.amount
              }], '', '', 4, 64, true, JSON.stringify({
                inputs: tx.inputs
              })]).subscribe(res => {

                sentTXs++;
                totalFee += res.fee;
                this.log.d(`revert ${sentTXs} fees`, tx);

                if (sentTXs === this.utxos.txs.length) {
                  this.fee = totalFee;
                }
              }, error => {
                this.log.er('errr');
              });
            });
        },
        error => {
          this.log.er('errr');
        });
  }

  revert() {

    this.disableColdstaking();

    let sentTXs = 0;
    let amount = 0;

    this.utxos.txs.map(tx => {

      this.log.d('revert for address', tx);

      this._rpc.call('sendtypeto', ['part', 'part', [{
        subfee: true,
        address: this.address,
        amount: tx.amount
      }], 'revert coldstaking', '', 4, 64, false, JSON.stringify({
        inputs: tx.inputs
      })]).subscribe(res => {
        this.log.d('revert response', res);
        amount += tx.amount;

        if (++sentTXs === this.utxos.txs.length) {
          this._rpc.state.set('ui:coldstaking', false);
          this.dialogRef.close();
          this.flashNotification.open(
            `Succesfully brought ${amount} PART into hot wallet`, 'warn');
        }
      });
    });

  }

  private disableColdstaking() {
    // TODO: move to coldstaking service
    this.log.d('undo coldstaking');

    this._rpc.call('walletsettings', ['changeaddress', {}]).subscribe(res => {

      this.log.d('disable coldstaking', res);
      if (res.changeaddress !== 'cleared') {
        return false;
      }

      // TODO: update status of cold staking widget
    });
  }

}
