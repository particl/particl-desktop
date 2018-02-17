import { Component, forwardRef, Inject, ViewChild } from '@angular/core';
import { Log } from 'ng2-logger';
import { MatDialogRef } from '@angular/material';

import { PasswordComponent } from '../shared/password/password.component';
import { IPassword } from '../shared/password/password.interface';

import { RpcService, RpcStateService } from '../../core/core.module';
import { SnackbarService } from '../../core/snackbar/snackbar.service'; // TODO; import from module
import { ModalsService } from '../modals.service';

@Component({
  selector: 'app-encryptwallet',
  templateUrl: './encryptwallet.component.html',
  styleUrls: ['./encryptwallet.component.scss']
})
export class EncryptwalletComponent {

  log: any = Log.create('encryptwallet.component');
  public password: string;

  @ViewChild('passwordElement') passwordElement: PasswordComponent;

  constructor(
    @Inject(forwardRef(() => ModalsService))
    private _modalsService: ModalsService,
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private flashNotification: SnackbarService,
    public _dialogRef: MatDialogRef<EncryptwalletComponent>
  ) { }

  encryptwallet(password: IPassword): void {
    if (this.password) {

      this.log.d(`check password equality: ${password.password === this.password}`);

      if (this.password === password.password) {
        this._rpcState.set('ui:spinner', true);
        this.log.d(`Encrypting wallet! password: ${this.password}`);
        this._rpc.call('encryptwallet', [password.password])
          .subscribe(
            response => {
              this.flashNotification.open(response);

              if (this._rpc.isElectron) {
                this._rpc.call('restart-daemon')
                  .subscribe(() => {
                    this._rpcState.set('ui:spinner', false);
                    if (!this._modalsService.initializedWallet) {
                      this._modalsService.open('createWallet', {forceOpen: true});
                    }
                    this._dialogRef.close();
                  });
              }
            },
            // Handle error appropriately
            error => {
              this._rpcState.set('ui:spinner', false);
              this.flashNotification.open('Wallet failed to encrypt properly!', 'err');
              this.log.er('error encrypting wallet', error)
            });
      } else {
        this._rpcState.set('ui:spinner', false);
        this.flashNotification.open('The passwords do not match!', 'err');
      }

    } else {
      this.log.d(`Setting password: ${password.password}`);
      this.password = password.password;
      this.passwordElement.clear();
    }
  }

  clearPassword(): void {
    this.password = undefined;
  }
}
