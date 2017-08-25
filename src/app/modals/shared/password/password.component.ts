import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Log } from 'ng2-logger';

import { IPassword } from './password.interface';

import { RPCService, EncryptionStatusService } from '../../../core/rpc/rpc.module';


@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent {

  /*
    UI State
  */
  password: string;
  stakeOnly: boolean = false;
  showPass: boolean = false;

  @Input() unlockText: string = 'YOUR WALLET PASSWORD';
  @Input() unlockButton: string;
  @Input() unlockTimeout: number = 60;
  @Input() showStakeOnly: boolean = true;
  @Input() isDisabled: boolean = false;

  /*
    The password emitter will send over an object with the password and stakingOnly info.
    This is useful as a building block in the initial setup, where we want to have the actual value of the password.
  */
  @Input() emitPassword: boolean = false;
  @Output() passwordEmitter: EventEmitter<IPassword> = new EventEmitter<IPassword>();


  /*
    The unlock emitter will automatically unlock the wallet for a given time and emit the JSON result
    of 'getwalletinfo'. This can be used to automatically request an unlock and instantly do a certain things:
    send a transaction, before it locks again.
  */
  @Input() emitUnlock: boolean = false;
  @Output() unlockEmitter: EventEmitter<string> = new EventEmitter<string>();

  log: any = Log.create('password.component');

  constructor (
    private _rpc: RPCService,
    private _encryptionStatusService: EncryptionStatusService) { }

  /*
    UI logic
  */
  passwordInputType(): string {
    return (this.showPass ? 'text' : 'password');
  }

  /*
    RPC logic starts here
  */

  unlock () {
    this.forceEmit();
  }


  public forceEmit() {
    if (this.emitPassword) {
      // emit password
      this.sendPassword();
    }

    if (this.emitUnlock) {
      // emit unlock
      this.rpc_unlock();
    }
  }

  /*
    Emit password!
  */

  sendPassword() {
    const pass: IPassword = {
      password: this.password,
      stakeOnly: this.stakeOnly
    }
    this.passwordEmitter.emit(pass);
  }

  /** Unlock the wallet
    * TODO: This should be moved to a service...
    */
  private rpc_unlock() {
    this.log.i('rpc_unlock: calling unlock! timeout=' + this.unlockTimeout);
    this.checkAndFallbackToStaking();
    this._rpc.call(this, 'walletpassphrase', [
        this.password,
        (this.stakeOnly ? 0 : this.unlockTimeout),
        this.stakeOnly
      ],
      () => {
        const _subs = this._encryptionStatusService.refreshEncryptionStatus()
          .subscribe((encryptionstatus: string) => {

            this.log.i('rpc_unlock: success: unlock was called!');
            // hook for unlockEmitter, warn parent component that wallet is unlocked!
            this.unlockEmitter.emit(encryptionstatus);

            // send out alert box
            // TODO: Use modals instead of alerts..
            if (encryptionstatus === 'Unlocked') {
              alert('Unlock succesful!');
            } else if (encryptionstatus === 'Unlocked, staking only') {
              alert('Unlock was succesful!');
            } else if (encryptionstatus === 'Locked') {
              alert('Warning: unlock was unsuccesful!');
            } else {
              alert('Wallet not encrypted!');
            }
            _subs.unsubscribe();
          });
      },
      () => {
        this.log.i('rpc_unlock_failed: unlock failed - wrong password?');
        // TODO: Use modals instead of alerts..
        alert('Unlock failed - password was incorrect.');
      }
    );
  }

  /**
    * If we're unlocking the wallet for a period of this.unlockTimeout, then check if it was staking
    * if(staking === true) then fallback to staking instead of locked after timeout!
    * else lock wallet
    */
  private checkAndFallbackToStaking() {
    if (this._encryptionStatusService.getEncryptionStatusState() === 'Unlocked, staking only') {
      const password = this.password;
      const timeout = this.unlockTimeout;
      const that = this;

      // After unlockTimeout, unlock wallet for staking again.
      setTimeout((() => {
          this.log.d(`checkAndFallbackToStaking, falling back into staking mode!`);
          this._rpc.call(that, 'walletpassphrase', [password, 0, true],
            function() {}
          );
          this.reset();
        }).bind(this), (timeout + 1) * 1000);

    } else {
      // reset after 500ms so rpc_unlock has enough time to use it!
      setTimeout(this.reset,  500);
    }
  }

  private reset() {
    this.password = '';
  }
}
