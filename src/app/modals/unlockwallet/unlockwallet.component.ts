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
    //this._rpc.call(this, 'walletpassphrase', [password, 99999, stakeOnly], this.rpc_unlockSuccesful);
  }

  passw(json: Object) {
    console.log("passw triggered");
  }

}
