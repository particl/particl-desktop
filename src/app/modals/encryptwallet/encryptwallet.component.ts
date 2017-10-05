import {
  Component, ComponentRef, Inject,
  forwardRef, ElementRef, ViewChild
} from '@angular/core';
import { Log } from 'ng2-logger';

import { ModalsService } from 'app/modals/modals.service';
import { RPCService } from '../../core/rpc/rpc.module';
import { PasswordComponent } from '../shared/password/password.component';
import { AlertComponent } from '../shared/alert/alert.component';
import { IPassword } from '../shared/password/password.interface';

@Component({
  selector: 'app-encryptwallet',
  templateUrl: './encryptwallet.component.html',
  styleUrls: ['./encryptwallet.component.scss']
})
export class EncryptwalletComponent {

  log: any = Log.create('encryptwallet.component');
  public password: string;

  @ViewChild('passwordElement')
  passwordElement: PasswordComponent;

  @ViewChild('alertBox')
  alertBox: AlertComponent;

  constructor(
    private _rpc: RPCService,
    @Inject(forwardRef(() => ModalsService))
    private _modalsService: ModalsService) { }

  encryptwallet(password: IPassword) {
    if (this.password) {

      this.log.d(`check password equality: ${password.password === this.password}`);

      if (this.password === password.password) {

        this.log.d(`Encrypting wallet! password: ${this.password}`);
        this._rpc.call('encryptwallet', [password.password])
          .subscribe(
            response => {
              this._rpc.toggleState(false);
              this.alertBox.open(response, 'Wallet');
              setTimeout(() => {
                this._rpc.call('restart-daemon')
                  .subscribe(() => {
                    if (!this._modalsService.encryptCheck) {
                      this._modalsService.open('createWallet', {forceOpen: true});
                      this._rpc.toggleState(true);
                    } else {
                      const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
                      document.body.dispatchEvent(escape)
                    }
                  });
              }, 5000);
            },
            // Handle error appropriately
            error => {
              this.alertBox.open('Wallet failed to encrypt properly!', 'Wallet');
              this.log.er('error encrypting wallet', error)
            });
      } else {
        this.alertBox.open('The passwords do not match!', 'Wallet');
      }

    } else {
      this.log.d(`Setting password: ${password.password}`);
      this.password = password.password;
      this.passwordElement.clear();
    }
  }

  clearPassword() {
    this.password = undefined;
  }
}
