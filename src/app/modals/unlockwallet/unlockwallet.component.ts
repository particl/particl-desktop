import { Component } from '@angular/core';
import { Log } from 'ng2-logger';

import { RPCService } from '../../core/rpc/rpc.service';
import {MdDialogRef} from "@angular/material";


@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  // constants
  DEFAULT_TIMEOUT: number = 60;
  log: any = Log.create('unlockwallet.component');

  private callback: Function;
  timeout: number = this.DEFAULT_TIMEOUT;
  showStakeOnly: boolean = true;

  constructor (private _rpc: RPCService,
  private dialogRef: MdDialogRef<UnlockwalletComponent>) { }

  unlock(encryptionStatus: string) {
    // unlock actually happened in password.component.ts
    this.log.d('Unlock signal emitted!');

    if (encryptionStatus.indexOf('Unlocked') !== -1) {
      if (!!this.callback) {
        this.callback();
      }

      // close the modal!
      this.closeModal();
    } else {
      // TODO: Proper error handling - Error modal?
      this.log.er('Error unlocking');
    }
  }

  /**
  * setData sets the callback information for when the wallet unlocks.
  */
  setData(data: any) {
    this.log.d('setting data');
    this.callback = data.callback;
    if (Number.isInteger(data.timeout)) {
      this.timeout = data.timeout;
    }
    this.showStakeOnly = Boolean(data.showStakeOnly);
  }

  closeModal() {
    // clear callback data
    this.timeout = this.DEFAULT_TIMEOUT;
    this.showStakeOnly = true;
    this.log.d('Closing modal!');
    this.dialogRef.close();
  }
}
