import { Component, Injectable } from '@angular/core';
import { ModalsModule } from '../modals.module';
import { Log } from 'ng2-logger';

import { RPCService } from '../../core/rpc/rpc.service';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  // constants
  DEFAULT_TIMEOUT: number = 60;
  log: any = Log.create('unlockwallet.component');

  // state callback
  instance: Injectable;
  callback: Function;
  timeout: number = this.DEFAULT_TIMEOUT;
  showStakeOnly: boolean = true;

  constructor (private _rpc: RPCService) { }

  unlock(json: Object) {
    // unlock actually happened in password.component.ts
    this.log.d('Unlock signal emitted!');

    // perform callback
    if (json['encryptionstatus'] === 'Unlocked' || json['encryptionstatus'] === 'Unlocked, staking only') {
      if (this.isCallbackSet()) {
        this.callback.call(this.instance);
        this.clearStateUnlockCallback();
      }
    }

    // close the modal!
    this.closeModal();
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



  clearStateUnlockCallback() {
    // clear callback data
    this.instance = undefined;
    this.callback = undefined;
    this.timeout = this.DEFAULT_TIMEOUT;
    this.showStakeOnly = true;
  }

  isCallbackSet(): boolean {
    return (this.instance !== undefined);
  }

  closeModal() {
    this.log.d('Closing modal!');
    document.getElementById('close').click();
  }
}
