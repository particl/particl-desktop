import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalsModule } from '../../modals.module';
import { RPCService } from '../../../core/rpc/rpc.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent implements Input, Output {


  private password: string;
  private stakeOnly: boolean = false;

  private showPass: boolean = false;

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

  constructor (private _rpc: RPCService) { }

  passwordInputType(): string {
    return (this.showPass ? 'text' : 'password');
  }

  unlock () {
    this.forceEmit();
  }

  public forceEmit() {
    if (this.emitPassword) {
      const obj = {
        password: this.password,
        stakeOnly: this.stakeOnly
      }

      this.passwordEmitter.emit(obj);
    }

    if (this.emitUnlock) {
      this.rpc_unlock();
    }
    this.reset();
  }

  rpc_unlock() {
    const password: string = this.password;
    const stakeOnly: boolean = this.stakeOnly;
    console.log('rpc_unlock in app-password: ' + password + ' '  + 99999  + ' ' + stakeOnly);
    this._rpc.call(this, 'walletpassphrase', [password, 99999, stakeOnly], this.rpc_unlockSuccesful);
  }

  rpc_unlockSuccesful(json: Object) {
    console.log('rpc_unlockSuccesful in app-password');
    this._rpc.call(this, 'getwalletinfo', null, this.walletAlert);
  }

  walletAlert(json: Object) {

    this.unlockEmitter.emit(json);

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
