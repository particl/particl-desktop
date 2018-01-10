import { Component, OnInit } from '@angular/core';

import { Log } from 'ng2-logger';

import { RpcService } from '../../../../../core/rpc/rpc.service';

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
    private _rpc: RpcService
  ) { }

  ngOnInit() {
    this._rpc.call('liststealthaddresses').subscribe(stealthAddresses => {

      this.log.d('stealth addresses', stealthAddresses)
      this.address = stealthAddresses[0]['Stealth Addresses'][0]['Address'];
      this.log.d('selected address', this.address)

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

  revertColdstaking() {

    this.disableColdstaking();

    this._rpc.call('sendtypeto', ['part', 'part', [{
      subfee: true,
      address: this.address,
      amount: this.utxos.amount
    }], 'revert coldstaking', '', 4, 64, false, JSON.stringify({
      inputs: this.utxos.txs
    })]).subscribe(tx => {
      this.log.d('revert response', tx);
      // TODO: flash notification, close modal
    })

  }

  disableColdstaking() {

    // TODO: move to coldstaking service
    this.log.d('undo coldstaking');

    this._rpc.call('walletsettings', ['changeaddress', {}]).subscribe(res => {

      this.log.d('disable coldstaking', res);
      if (res.changeaddress !== 'cleared') {
        return false;
      }

      // TODO: update status of cold staking widget
      // flash notification

    });
  }

}
