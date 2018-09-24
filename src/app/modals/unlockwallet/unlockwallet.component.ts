import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcService } from '../../core/core.module';
import { MatDialogRef } from '@angular/material';
import { UnlockModalConfig } from 'app/modals/models/unlock.modal.config.interface';

@Component({
  selector: 'app-unlockwallet',
  templateUrl: './unlockwallet.component.html',
  styleUrls: ['./unlockwallet.component.scss']
})
export class UnlockwalletComponent {

  // constants
  // DEFAULT_TIMEOUT: number = 60;
  DEFAULT_TIMEOUT: number = 300;
  log: any = Log.create('unlockwallet.component');

  @Output() unlockEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Input() autoClose: boolean = true;

  private callback: Function;
  timeout: number = this.DEFAULT_TIMEOUT;
  showStakeOnly: boolean = false;
  stakeOnly: boolean = false;
  constructor(
    private _rpc: RpcService,
    public _dialogRef: MatDialogRef<UnlockwalletComponent>) {
  }

  unlock(encryptionStatus: string): void {
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
  setData(data: UnlockModalConfig, callback: Function): void {
    this.log.d('setting callback, timeout & showStakeOnly data');

    if (callback instanceof Function) {
      this.callback = callback;
    }

    if (Number.isInteger(data.timeout)) {
      this.timeout = data.timeout;
    }
    this.showStakeOnly = Boolean(data.showStakeOnly);
    this.stakeOnly = Boolean(data.stakeOnly)
    this.autoClose = (data.autoClose !== false)
  }

  closeModal(): void {
    // clear callback data
    this.timeout = this.DEFAULT_TIMEOUT;
    this.showStakeOnly = true;
    this.log.d('Closing modal!');

    if (this.autoClose ) {
      this._dialogRef.close();
      this.log.d('Closing modal!');
    }
  }
}
