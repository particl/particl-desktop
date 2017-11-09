import {Component, forwardRef, Inject, ViewChild} from '@angular/core';
import { Log } from 'ng2-logger';

import { RPCService } from '../../core/rpc/rpc.module';
import { PasswordComponent } from '../shared/password/password.component';
import { IPassword } from '../shared/password/password.interface';
import { FlashNotificationService } from '../../services/flash-notification.service';
import { ModalsService } from '../modals.service';

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

  constructor(private _rpc: RPCService,
              private flashNotification: FlashNotificationService,
              @Inject(forwardRef(() => ModalsService))
              private _modalsService: ModalsService) {
  }

  encryptwallet(password: IPassword) {
    if (this.password) {

      this.log.d(`check password equality: ${password.password === this.password}`);

      if (this.password === password.password) {
        this._rpc.state.set('ui:spinner', true);
        this.log.d(`Encrypting wallet! password: ${this.password}`);
        this._rpc.call('encryptwallet', [password.password])
          .subscribe(
            response => {
              this._rpc.state.set('ui:spinner', false);
              this._rpc.toggleState(false);
              this.flashNotification.open(response);

              if (this._rpc.isElectron) {
                this._rpc.call('restart-daemon')
                  .subscribe(() => {
                    if (!this._modalsService.initializedWallet) {
                      this._modalsService.open('createWallet', {forceOpen: true});
                      this._rpc.toggleState(true);
                    } else {
                      this._modalsService.close();
                    }
                  });
              }
            },
            // Handle error appropriately
            error => {
              this._rpc.state.set('ui:spinner', false);
              this.flashNotification.open('Wallet failed to encrypt properly!', 'err');
              this.log.er('error encrypting wallet', error)
            });
      } else {
        this._rpc.state.set('ui:spinner', false);
        this.flashNotification.open('The passwords do not match!', 'err');
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
