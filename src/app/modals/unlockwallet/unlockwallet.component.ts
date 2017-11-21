import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcService } from '../../core/core.module';
import { MdDialogRef } from '@angular/material';
import { ModalsComponent } from '../modals.component';


@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  // constants
  DEFAULT_TIMEOUT: number = 60;
  log: any = Log.create('unlockwallet.component');

  @Output() unlockEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Input() autoClose: boolean = true;

  private callback: Function;
  timeout: number = this.DEFAULT_TIMEOUT;
  showStakeOnly: boolean = false;

  constructor(private _rpc: RpcService,
              public dialogRef: MdDialogRef<ModalsComponent>) {
  }

  unlock(encryptionStatus: string) {
    // unlock actually happened in password.component.ts
    this.log.d('Unlock signal emitted! = ' + encryptionStatus );

    if (encryptionStatus.indexOf('Unlocked') !== -1) {
      if (!!this.callback) {
        this.callback();
      }
      // unlock wallet emitter
      this.unlockEmitter.emit(encryptionStatus);
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
    this.log.d('setting callback, timeout & showStakeOnly data');
    this.callback = data.callback;
    if (Number.isInteger(data.timeout)) {
      this.timeout = data.timeout;
    }
    this.showStakeOnly = Boolean(data.showStakeOnly);
    this.autoClose = (data.autoClose !== false)
  }

  closeModal() {
    // clear callback data
    this.timeout = this.DEFAULT_TIMEOUT;
    this.showStakeOnly = true;
    this.log.d('Closing modal!');

    if (this.autoClose ) {
      this.dialogRef.componentInstance.close();
      this.log.d('Closing modal!');
    }
  }
}
