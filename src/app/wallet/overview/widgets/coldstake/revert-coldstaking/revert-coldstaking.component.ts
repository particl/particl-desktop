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
  public utxos: any;

  address: string;

  constructor(
    private flashNotification: SnackbarService,
    private dialogRef: MatDialogRef<RevertColdstakingComponent>,
    private _modals: ModalsService,
    private _rpc: RpcService
  ) { }

  ngOnInit() {
    this._rpc.call('liststealthaddresses').subscribe(stealthAddresses => {

      this.log.d('stealth addresses', stealthAddresses)
      this.address = stealthAddresses[0]['Stealth Addresses'][0]['Address'];
      this.log.d('selected address', this.address)

      this.log.d('amount', this.utxos.amount);

      this._rpc.call('sendtypeto', ['part', 'part', [{
        subfee: true,
        address: this.address,
        amount: this.utxos.amount
      }], '', '', 4, 64, true, JSON.stringify({
        inputs: this.utxos.txs
      })]).subscribe(tx => {
        this.log.d('revert fees', tx);
        this.fee = tx.fee;
      })
    });
  }

  revert() {

    this.disableColdstaking();

    this._rpc.call('sendtypeto', ['part', 'part', [{
      subfee: true,
      address: this.address,
      amount: this.utxos.amount
    }], 'revert coldstaking', '', 4, 64, false, JSON.stringify({
      inputs: this.utxos.txs
    })]).subscribe(tx => {
      this.log.d('revert response', tx);

      this._rpc.state.set('ui:coldstaking', false);
      this.dialogRef.close();
      this.flashNotification.open(
        `Succesfully brought ${this.utxos.amount} PART into hot wallet`, 'warn');
    })

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
