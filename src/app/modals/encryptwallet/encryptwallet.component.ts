import { Component, OnInit, ViewChild, ElementRef, ComponentRef } from '@angular/core';
import { Log } from 'ng2-logger';

import { RPCService } from '../../core/rpc/rpc.module';
import { PasswordComponent } from '../shared/password/password.component';
import { IPassword } from '../shared/password/password.interface';

@Component({
  selector: 'app-encryptwallet',
  templateUrl: './encryptwallet.component.html',
  styleUrls: ['./encryptwallet.component.scss']
})
export class EncryptwalletComponent implements OnInit {

  log: any = Log.create('unlockwallet.component');
  public password: string;

  @ViewChild('passwordElement') passwordElement: PasswordComponent;

  constructor(private _rpc: RPCService) { }

  ngOnInit() {
  }

  encryptwallet(password: IPassword) {
    if (this.password) {

      this.log.d(`check password equality: ${password.password === this.password}`);

      if (this.password === password.password) {

        this.log.d(`Encrypting wallet! password: ${this.password}`);
        this._rpc.call('encryptwallet', [password.password])
            .subscribe(
            (response: any) => {
              alert(response);
              document.getElementById('close').click();
            } ,
            // Handle error appropriately
            error => {
              alert('Wallet failed to encrypt properly!');
              this.log.er('encryptwallet: error encrypting wallet', error)
            });
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
