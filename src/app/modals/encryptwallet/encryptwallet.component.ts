import { Component, ViewChild } from '@angular/core';
import { Log } from 'ng2-logger';

import { RPCService } from '../../core/rpc/rpc.module';
import { PasswordComponent } from '../shared/password/password.component';
import { AlertComponent } from '../shared/alert/alert.component';
import { IPassword } from '../shared/password/password.interface';
import { FlashNotificationService } from '../../services/flash-notification.service';

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
  constructor(private _rpc: RPCService,
              private flashNotification: FlashNotificationService) {
  }

  encryptwallet(password: IPassword) {
    if (this.password) {

      this.log.d(`check password equality: ${password.password === this.password}`);

      if (this.password === password.password) {

        this.log.d(`Encrypting wallet! password: ${this.password}`);
        this._rpc.call('encryptwallet', [password.password])
            .subscribe(
            (response: any) => {
              this.log.d(`Encrypting wallet! password: ${this.password}`);
              this.flashNotification.open(`response`);
            } ,
            // Handle error appropriately
            error => {
              this.flashNotification.open('Wallet failed to encrypt properly!');
              this.log.er('error encrypting wallet', error)
            });
      } else {
        this.flashNotification.open('The passwords do not match!');
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
