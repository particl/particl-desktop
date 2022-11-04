import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, ViewChild, ViewContainerRef } from "@angular/core";
import { of } from "rxjs";
import { catchError, take, tap } from "rxjs/operators";

import { Store } from "@ngxs/store";
import { SettingsActions, WalletURLState, WalletURLStateModel } from "app/main-wallet/shared/state-store/wallet-store.state";
import { SnackbarService } from "app/main/services/snackbar/snackbar.service";
import { SettingField } from "app/main/components/settings/abstract-setting.model";
import { URLSettingComponent, URLSettingDetails } from "app/main/components/settings/components/url.component";


enum TextContent {
  SAVE_FAILED = 'Failed to change {setting}',
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


    const urlAddressSettings: SettingField<string> = {
      title: 'Address URL',
      description: `The external URL of the block explorer for referencing address-related details. Leave empty to disable. Use the parameter {addressid} that will be substituted with the actual address.`,
      tags: [],
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
              }
            }
          })
        );
      },
      value: walletURLs.address,
    };
    const urlAddressDetails: URLSettingDetails = {
      allowEmpty: true
    };

    const urlAddressComp = this.urlContainer.createComponent(urlFactory);
    urlAddressComp.instance.details = urlAddressDetails;
    urlAddressComp.instance.setting = urlAddressSettings;


    const urlTransactionSettings: SettingField<string> = {
      title: 'Transaction URL',
      description: `The external URL of the block explorer for referencing transaction-related details. Leave empty to disable. Use the parameter {txid} that will be substituted with the actual transaction ID.`,
      tags: [],
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
              }
            }
          })
        );
      },
      value: walletURLs.transaction,
    };
    const urlTransactionDetails: URLSettingDetails = {
      allowEmpty: true
    };

    const urlTransactionComp = this.urlContainer.createComponent(urlFactory);
    urlTransactionComp.instance.details = urlTransactionDetails;
    urlTransactionComp.instance.setting = urlTransactionSettings;


    this._cdr.detectChanges();
  }
}
