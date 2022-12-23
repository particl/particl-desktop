import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, ComponentFactoryResolver, ViewChild, ViewContainerRef
} from '@angular/core';
import { of } from 'rxjs';
import { catchError, take, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { SettingsActions, WalletURLState, WalletURLStateModel } from 'app/main-wallet/shared/state-store/wallet-store.state';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { SettingField } from 'app/main/components/settings/abstract-setting.model';
import { URLSettingComponent, URLSettingDetails } from 'app/main/components/settings/components/url.component';
import { Particl } from 'app/networks/networks.module';


enum TextContent {
  SAVE_FAILED = 'Failed to change {setting}',
  INLINE_ERROR_URL = 'Invalid URL',
}



@Component({
  templateUrl: './general-config.component.html',
  styleUrls: ['./general-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralConfigComponent implements AfterViewInit {


  @ViewChild('settingsURL', {static: false, read: ViewContainerRef}) urlContainer: ViewContainerRef;

  constructor(
    private _resolver: ComponentFactoryResolver,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _snackbar: SnackbarService,
  ) { }


  ngAfterViewInit(): void {
    this.urlContainer.clear();

    const urlFactory = this._resolver.resolveComponentFactory(URLSettingComponent);

    const walletURLs = this._store.selectSnapshot<WalletURLStateModel>(WalletURLState);
    const particlChain = this._store.selectSnapshot(Particl.State.Blockchain._chain);


    const urlAddressComp = this.urlContainer.createComponent(urlFactory);
    const urlAddressSettings: SettingField<string> = {
      title: `Address URL, for chain: ${particlChain}`,
      description: `The external URL of the block explorer for referencing address-related details. Leave empty to disable. Use the parameter {addressid} that will be substituted with the actual address.`,
      tags: ['Advanced', `${particlChain} chain`],
      isDisabled: false,
      requiresRestart: false,
      defaultValue: '',
      placeholder: 'Block explorer Address lookup URL',
      updateValue: (newValue) => {
        this._store.dispatch(new SettingsActions.ChangeURL('address', newValue)).pipe(
          take(1),
          catchError(() => of(null)),
          tap({
            next: () => {
              const success = this._store.selectSnapshot(WalletURLState.get('address')) === newValue;
              if (!success) {
                this._snackbar.open(TextContent.SAVE_FAILED.replace('{setting}', 'address URL'), 'warn');
                urlAddressComp.instance.errorMsg = TextContent.INLINE_ERROR_URL;
                this._cdr.detectChanges();
              }
            }
          })
        ).subscribe();
      },
      value: walletURLs.address,
    };
    const urlAddressDetails: URLSettingDetails = {
      allowEmpty: true
    };
    urlAddressComp.instance.details = urlAddressDetails;
    urlAddressComp.instance.setting = urlAddressSettings;


    const urlTransactionComp = this.urlContainer.createComponent(urlFactory);
    const urlTransactionSettings: SettingField<string> = {
      title: `Transaction URL, for chain: ${particlChain}`,
      description: `The external URL of the block explorer for referencing transaction-related details. Leave empty to disable. Use the parameter {txid} that will be substituted with the actual transaction ID.`,
      tags: ['Advanced', `${particlChain} chain`],
      isDisabled: false,
      requiresRestart: false,
      defaultValue: '',
      placeholder: 'Block explorer Transaction lookup URL',
      updateValue: (newValue) => {
        this._store.dispatch(new SettingsActions.ChangeURL('transaction', newValue)).pipe(
          take(1),
          catchError(() => of(null)),
          tap({
            next: () => {
              const success = this._store.selectSnapshot(WalletURLState.get('transaction')) === newValue;
              if (!success) {
                this._snackbar.open(TextContent.SAVE_FAILED.replace('{setting}', 'transaction URL'), 'warn');
                urlTransactionComp.instance.errorMsg = TextContent.INLINE_ERROR_URL;
                this._cdr.detectChanges();
              }
            }
          })
        ).subscribe();
      },
      value: walletURLs.transaction,
    };
    const urlTransactionDetails: URLSettingDetails = {
      allowEmpty: true
    };
    urlTransactionComp.instance.details = urlTransactionDetails;
    urlTransactionComp.instance.setting = urlTransactionSettings;


    this._cdr.detectChanges();
  }
}
