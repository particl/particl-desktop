import { Component, Injectable } from '@angular/core';
import { ModalsModule } from '../modals.module';

import { RPCService } from '../../core/rpc/rpc.service';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  instance: Injectable;
  callback: Function;
  timeout: number;
  showStakeOnly: boolean;

  constructor (private _rpc: RPCService) { }

  unlock(json: Object) {
    // unlock actually happened in password.component.ts
    console.log('Unlock emitted!');
    // perform callback
    if (json['encryptionstatus'] === 'Unlocked' || json['encryptionstatus'] === 'Unlocked, staking only') {
      this.callback.call(this.instance);

      // clear callback data
      this.instance = undefined;
      this.callback = undefined;
      this.timeout = undefined;
      this.showStakeOnly = undefined;
    }

    // close the modal!
    document.getElementById('close').click();
  }

  passw(json: Object) {
    console.log('passw triggered');
  }

  /**
  * setData sets the callback information for when the wallet unlocks.
  */
  setData(data: any) {
    this.instance = data.instance;
    this.callback = data.callback;
    this.timeout = data.timeout;
    this.showStakeOnly = false;
  }

}
