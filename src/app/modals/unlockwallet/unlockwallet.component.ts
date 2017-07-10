import { Component } from '@angular/core';
import { ModalsModule } from '../modals.module';

import { RPCService } from '../../core/rpc/rpc.service';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  constructor (private _rpc: RPCService) { }

  unlock(obj: Object) {
    // TODO API call
    const password: string = obj['password'];
    const stakeOnly: boolean = obj['stakeOnly'];
    console.log('walletpassphrase');
    this._rpc.call(this, 'walletpassphrase', [password, 99999, stakeOnly], this.rpc_unlockSuccesful);
  }

  rpc_unlockSuccesful(json: Object) {
    console.log('callback triggered');
    this._rpc.call(this, 'getwalletinfo', null, this.walletAlert);
  }

  walletAlert(json: Object) {
    const encryptionstatus = json['encryptionstatus'];
    if (encryptionstatus === 'Unlocked') {
      alert('Unlock succesful!');
    } else if (encryptionstatus === 'Unlocked, staking only') {
      alert('Unlock was succesful!');
    } else if (encryptionstatus === 'Locked') {
      alert('Warning: unlock was unsuccesful!');
    } else {
      alert('Wallet not encrypted!');
    }
  }
}
