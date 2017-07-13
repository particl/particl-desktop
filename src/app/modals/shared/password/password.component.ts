import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalsModule } from '../../modals.module';
import { RPCService } from '../../../core/rpc/rpc.service';
import { Log } from 'ng2-logger';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent {

  password: string;
  stakeOnly: boolean = false;

  showPass: boolean = false;


  @Input() unlockText: string = 'YOUR WALLET PASSWORD';
  @Input() unlockButton: string;
  @Input() showStakeOnly: boolean = true;

  /*
    The password emitter will send over an object with the password and stakingOnly info.
    This is useful as a building block in the initial setup, where we want to have the actual value of the password.
  */
  @Input() emitPassword: boolean = false;
  @Output() passwordEmitter: EventEmitter<Object> = new EventEmitter<Object>();


  /*
    The unlock emitter will automatically unlock the wallet for a given time and emit the JSON result
    of 'getwalletinfo'. This can be used to automatically request an unlock and instantly do a certain things:
    send a transaction, before it locks again.
  */
  @Input() emitUnlock: boolean = false;
  @Output() unlockEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  log: any = Log.create('password.component');

  constructor (private _rpc: RPCService) { }

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
      this.emitPassword();
    }

    if (this.emitUnlock) {
      // emit unlock
      this.rpc_unlock();
    }
    this.reset();
  }

  /*
    Emit password!
  */

  emitPassword() {
    const obj = {
      password: this.password,
      stakeOnly: this.stakeOnly
    }

  /*
    _Actually_ unlock the wallet!
  */

  rpc_unlock() {
    this.log.i('rpc_unlock: calling unlock!');
    this._rpc.call(this, 'walletpassphrase', [this.password, 99999, this.stakeOnly], this.rpc_unlock_success);
  }

  rpc_unlock_success(json: Object) {
    this.log.i('rpc_unlock_success: unlock was succesful :)');
    this._rpc.call(this, 'getwalletinfo', null, this.rpc_alertEncryptionStatus);
  }

  rpc_alertEncryptionStatus(json: Object) {

    // hook for unlockEmitter, warn parent component that wallet is unlocked!
    this.unlockEmitter.emit(json);

    // send out alert box
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

  reset() {
    this.password = '';
  }

}
