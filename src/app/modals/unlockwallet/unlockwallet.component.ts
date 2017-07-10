import { Component } from '@angular/core';
import { ModalsModule } from '../modals.module';

import { AppService } from '../../app.service';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  constructor (private appService: AppService) { }

  unlock(obj: Object) {
    // TODO API call
    const password: string = obj['password'];
    const stakeOnly: boolean = obj['stakeOnly'];

    this.appService.rpc.call(this, 'walletpassphrase', [password, 99999, stakeOnly], this.rpc_unlockSuccesful);
    alert(obj['password'] + obj['stakeOnly']);
  }

  rpc_unlockSuccesful(JSON: Object) {
    this.appService.rpc.call(this, 'getwalletinfo', null, this.walletAlert);
  }

  walletAlert(JSON: Object) {
    const encryptionstatus = JSON['encryptionstatus'];
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
