import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ComponentFactoryResolver, ViewChild, ViewContainerRef
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { of } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { Particl, ParticlRpcService } from 'app/networks/networks.module';
import { SettingsActions, WalletSettingsState, WalletSettingsStateModel } from 'app/main-wallet/shared/state-store/wallet-store.state';

import { ButtonSettingComponent, ButtonSettingDetails } from 'app/main/components/settings/components/button.component';
import { NumberSettingComponent, NumberSettingDetails } from 'app/main/components/settings/components/number.component';
import { SettingField } from 'app/main/components/settings/abstract-setting.model';

import { WalletBackupModalComponent } from '../../wallet-backup-modal/wallet-backup-modal.component';
import { DeriveWalletModalComponent } from '../../derive-wallet-modal/derive-wallet-modal.component';
import { ChangeWalletPasswordModalComponent } from '../../change-wallet-password-modal/change-wallet-password-modal.component';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { DEFAULT_RING_SIZE, DEFAULT_UTXO_SPLIT, MAX_RING_SIZE, MAX_UTXO_SPLIT, MIN_RING_SIZE, MIN_UTXO_SPLIT } from 'app/networks/particl/particl.models';




enum TextContent {
  SAVE_SUCCESSFUL = 'Successfully applied changes',
  SAVE_FAILED = 'Failed to apply selected changes',
}


@Component({
  templateUrl: './wallet-settings.component.html',
  styleUrls: ['./wallet-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletSpecificSettingsComponent implements AfterViewInit {

  @ViewChild('transactionSettings', {static: false, read: ViewContainerRef}) transactionContainer: ViewContainerRef;
  @ViewChild('actionSettings', {static: false, read: ViewContainerRef}) actionContainer: ViewContainerRef;


  constructor(
    private _resolver: ComponentFactoryResolver,
    private _dialog: MatDialog,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _rpc: ParticlRpcService,
    private _snackbar: SnackbarService,
  ) { }


  ngAfterViewInit(): void {
    this.transactionContainer.clear();
    this.actionContainer.clear();

    const hasEncryptionPassword = this._store.selectSnapshot(Particl.State.Wallet.Info.hasEncryptionPassword());
    const walletName: string = this._store.selectSnapshot(Particl.State.Wallet.Info.getValue('walletname')) as string;
    const walletSettings = this._store.selectSnapshot<WalletSettingsStateModel>(WalletSettingsState);

    const numberFactory = this._resolver.resolveComponentFactory(NumberSettingComponent);
    const buttonFactory = this._resolver.resolveComponentFactory(ButtonSettingComponent);


    const numSplitUTXOSettings: SettingField<number> = {
      title: 'Split UTXOs when sending TXs',
      description: `Creates a number of UTXOs when sending funds from this wallet - higher the number, the more utxos available, the greater the annonymity for stealth addresses, and the greater the coin usage and fees (default: ${DEFAULT_UTXO_SPLIT}, max: ${MAX_UTXO_SPLIT})`,
      tags: [],
      isDisabled: false,
      requiresRestart: false,
      defaultValue: DEFAULT_UTXO_SPLIT,
      placeholder: '',
      updateValue: (newValue) => {
        this._store.dispatch(new SettingsActions.ChangeSetting(walletName, 'utxo_split_count', newValue)).pipe(
          take(1),
          catchError(() => of(null)),
          tap({
            next: () => {
              const success = this._store.selectSnapshot(WalletSettingsState.settings).utxo_split_count === newValue;
              if (!success) {
                this._snackbar.open(TextContent.SAVE_FAILED, 'warn');
              }
            }
          })
        );
      },
      value: walletSettings.utxo_split_count,
    };
    const numSplitUTXODetails: NumberSettingDetails = {
      min: MIN_UTXO_SPLIT,
      max: MAX_UTXO_SPLIT,
      step: 1
    };

    const numSplitUTXO = this.transactionContainer.createComponent(numberFactory);
    numSplitUTXO.instance.details = numSplitUTXODetails;
    numSplitUTXO.instance.setting = numSplitUTXOSettings;


    const numRingSizeSettings: SettingField<number> = {
      title: 'Default transaction RingCT size',
      description: `Set the default RingCT size for anon transactions (default: ${DEFAULT_RING_SIZE}, max: ${MAX_RING_SIZE})`,
      tags: [],
      isDisabled: false,
      requiresRestart: false,
      defaultValue: DEFAULT_RING_SIZE,
      placeholder: '',
      updateValue: (newValue) => {
        this._store.dispatch(new SettingsActions.ChangeSetting(walletName, 'default_ringct_size', newValue)).pipe(
          take(1),
          catchError(() => of(null)),
          tap({
            next: () => {
              const success = this._store.selectSnapshot(WalletSettingsState.settings).default_ringct_size === newValue;
              if (!success) {
                this._snackbar.open(TextContent.SAVE_FAILED, 'warn');
              }
            }
          })
        );
      },
      value: walletSettings.default_ringct_size,
    };
    const numRingSizeDetails: NumberSettingDetails = {
      min: MIN_RING_SIZE,
      max: MAX_RING_SIZE,
      step: 1
    };

    const numRingSize = this.transactionContainer.createComponent(numberFactory);
    numRingSize.instance.details = numRingSizeDetails;
    numRingSize.instance.setting = numRingSizeSettings;


    const buttonBackupSettings: SettingField<null> = {
      title: 'Backup Wallet',
      description: 'Create a wallet file backup (the wallet.dat file for the current wallet) in a different folder location.',
      tags: [],
      isDisabled: false,
      requiresRestart: false,
      defaultValue: null,
      placeholder: 'Backup Wallet',
      updateValue: () => {
        const dialogRef = this._dialog.open(WalletBackupModalComponent);
        dialogRef.componentInstance.onConfirmation.subscribe(async (folderPath: string) => {
          const success = await this._rpc.call('backupwallet', [folderPath]).toPromise().then(() => true).catch(() => false);
          this._snackbar.open(success ? TextContent.SAVE_SUCCESSFUL : TextContent.SAVE_FAILED, success ? 'success' : 'warn');
        });
      },
      value: null,
    };
    const buttonBackupDetails: ButtonSettingDetails = {
      icon: 'part-archive',
      color: 'primary',
    };

    const buttonBackup = this.actionContainer.createComponent(buttonFactory);
    buttonBackup.instance.details = buttonBackupDetails;
    buttonBackup.instance.setting = buttonBackupSettings;


    const buttonChangePassSettings: SettingField<null> = {
      title: 'Change Wallet Password',
      description: 'Allows for the changing of the wallet password if the wallet has an encryption password set.',
      tags: [],
      requiresRestart: false,
      isDisabled: !hasEncryptionPassword,
      defaultValue: null,
      placeholder: 'Change Password',
      updateValue: () => {
        this._dialog.open(ChangeWalletPasswordModalComponent);
      },
      value: null,
    };
    const buttonChangePassDetails: ButtonSettingDetails = {
      icon: 'part-refresh',
      color: 'primary',
    };

    const buttonChangePass = this.actionContainer.createComponent(buttonFactory);
    buttonChangePass.instance.details = buttonChangePassDetails;
    buttonChangePass.instance.setting = buttonChangePassSettings;


    const buttonDeriveWalletSettings: SettingField<null> = {
      title: 'Create Derived Wallet Accounts',
      description: 'Create wallets that are derived accounts from the current active wallet.',
      tags: ['Advanced'],
      isDisabled: false,
      requiresRestart: false,
      defaultValue: null,
      placeholder: 'Derive Wallets',
      updateValue: () => {
        this._dialog.open(DeriveWalletModalComponent, { autoFocus: false });
      },
      value: null,
    };
    const buttonDeriveWalletDetails: ButtonSettingDetails = {
      icon: 'part-add-account',
      color: 'warn',
    };

    const buttonDeriveWallet = this.actionContainer.createComponent(buttonFactory);
    buttonDeriveWallet.instance.details = buttonDeriveWalletDetails;
    buttonDeriveWallet.instance.setting = buttonDeriveWalletSettings;


    this._cdr.detectChanges();
  }

}
