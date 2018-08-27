import { Component, forwardRef, Inject, ViewChild } from '@angular/core';
import { Log } from 'ng2-logger';
import { MatDialogRef } from '@angular/material';

import { PasswordComponent } from '../shared/password/password.component';
import { IPassword } from '../shared/password/password.interface';

import { RpcService, RpcStateService } from '../../core/core.module';
import { SnackbarService } from '../../core/snackbar/snackbar.service'; // TODO; import from module
import { UpdaterService } from 'app/core/updater/updater.service';
import { ModalsHelperService } from 'app/modals/modals-helper.service';

@Component({
  selector: 'app-encryptwallet',
  templateUrl: './encryptwallet.component.html',
  styleUrls: ['./encryptwallet.component.scss']
})
export class EncryptwalletComponent {

  log: any = Log.create('encryptwallet.component');
  public password: string;

  public pleaseWait: boolean = false;

  @ViewChild('passwordElement') passwordElement: PasswordComponent;

  constructor(
    @Inject(forwardRef(() => ModalsHelperService))
    private _modals: ModalsHelperService,
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private flashNotification: SnackbarService,
    private _daemon: UpdaterService,
    public _dialogRef: MatDialogRef<EncryptwalletComponent>
  ) { }

  async encryptwallet(password: IPassword) {
    // set password first time
    if (!this.password) {
      this.log.d(`Setting password: ${password.password}`);
      this.password = password.password;
      this.passwordElement.clear();
      return;
    }

    // already had password, check equality
    this.log.d(`check password equality: ${password.password === this.password}`);
    if (this.password !== password.password) {
      this.flashNotification.open('The passwords do not match!', 'err');
      return;
    }

    // passwords match, encrypt wallet

    if (window.electron) {
      this._daemon.restart().then(res => {
        this.log.d('restart was trigger, open create wallet again');
        if (!this._modals.initializedWallet) {
          this._rpcState.observe('getwalletinfo').skip(1).take(1).subscribe(wallet => {
            this.pleaseWait = false;
            this._modals.createWallet();
            this._dialogRef.close();
          });

        }
      });
    }

    this._rpc.call('encryptwallet', [password.password]).toPromise()
      .then((s) => this.pleaseWait = true)
      .catch(error => {
        // Handle error appropriately
        this.flashNotification.open('Wallet failed to encrypt properly!', 'err');
        this.log.er('error encrypting wallet', error)
      });


  }

  clearPassword(): void {
    this.password = undefined;
  }
}
