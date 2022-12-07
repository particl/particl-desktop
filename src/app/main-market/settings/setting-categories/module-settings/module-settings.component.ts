import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core";
import { combineLatest, defer, iif, of, Subject } from "rxjs";
import { catchError, concatMap, take, takeUntil, takeWhile, tap } from "rxjs/operators";

import { Store } from "@ngxs/store";
import { Particl } from "app/networks/networks.module";
import { MarketState } from "../../../store/market.state";
import { MarketUserActions } from "../../../store/market.actions";

import { BackendService } from "app/core/services/backend.service";
import { SnackbarService } from "app/main/services/snackbar/snackbar.service";
import { NumberSettingComponent, NumberSettingDetails } from "app/main/components/settings/components/number.component";
import { URLSettingComponent, URLSettingDetails } from "app/main/components/settings/components/url.component";
import { IPCResponses } from "../../../store/market.models";
import { ChainType } from "app/networks/particl/particl.models";
import { SettingField } from "app/main/components/settings/abstract-setting.model";
import { isBasicObjectType } from "app/main-market/shared/utils";



enum TextContent {
  LOAD_ERROR = 'Failed to load configuration/settings',
  SAVE_FAILED = 'Failed to change {setting}',
  INLINE_ERROR_URL = 'Invalid URL',
}



@Component({
  templateUrl: './module-settings.component.html',
  styleUrls: ['./module-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModuleSettingsComponent implements AfterViewInit, OnDestroy {


  @ViewChild('connectionsContainer', {static: false, read: ViewContainerRef}) connectionsContainer: ViewContainerRef;
  @ViewChild('urlsContainer', {static: false, read: ViewContainerRef}) urlsContainer: ViewContainerRef;


  private destroy$: Subject<void> = new Subject();

  constructor(
    private _resolver: ComponentFactoryResolver,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _snackbar: SnackbarService,
    private _backendService: BackendService
  ) { }


  ngAfterViewInit(): void {
    combineLatest([
      this._store.select(Particl.State.Blockchain._chain).pipe(
        takeWhile(chain => !!chain),
        takeUntil(this.destroy$)
      ),
      this._backendService.sendAndWait<IPCResponses.getSettings>('apps:market:market:getSettings').pipe(
        take(1),
        catchError(() => of({ urls: undefined, network: undefined})),
      )
    ]).pipe(
      tap({
        next: (settings) => {
          const chain = settings[0];
          const network = settings[1];
          if (!chain || !network || !network.urls || !network.network) {
            this._snackbar.open(TextContent.LOAD_ERROR, 'warn');
            return;
          }
          this.loadSettings(chain, network);
          this._cdr.detectChanges();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadSettings(chain: ChainType, networkSettings: IPCResponses.getSettings): void {
    this.connectionsContainer.clear();
    this.urlsContainer.clear();

    const urlFactory = this._resolver.resolveComponentFactory(URLSettingComponent);
    const numberFactory = this._resolver.resolveComponentFactory(NumberSettingComponent);

    const defaultConfig = this._store.selectSnapshot(MarketState.defaultConfig);


    const numPortSettings: SettingField<number> = {
      title: 'Market Connection Port',
      description: `Change the port that the Market application starts on (default: ${defaultConfig.port})`,
      tags: [],
      isDisabled: false,
      requiresRestart: true,
      defaultValue: defaultConfig.port,
      placeholder: `Default: ${defaultConfig.port}`,
      updateValue: (newValue) => {
        if (!chain) {
          return;
        }
        this._backendService.sendAndWait<boolean>('apps:market:market:setSetting', `network.port`, newValue).pipe(
          catchError(() => of(false)),
          concatMap(success => iif(
            () => !success,
            defer(() => this._snackbar.open(TextContent.SAVE_FAILED.replace('{setting}', 'Market Connection Port'), 'warn')),
            defer(() => this._store.dispatch(new MarketUserActions.SetSetting('port', newValue)))
          )),
        ).subscribe();
      },
      value: isBasicObjectType(networkSettings) && isBasicObjectType(networkSettings.network) && typeof networkSettings.network.port === 'number' ? networkSettings.network.port : defaultConfig.port,
    };
    const numPortDetails: NumberSettingDetails = {
      min: 1025,
      max: 65535,
      step: 1
    };
    const numPortComp = this.connectionsContainer.createComponent(numberFactory);
    numPortComp.instance.details = numPortDetails;
    numPortComp.instance.setting = numPortSettings;


    const numTimeoutSettings: SettingField<number> = {
      title: 'Marketplace Service Startup Timeout',
      description: `Number of seconds to wait for a successful startup response from the Marketplace service before deeming that the service has errored. Increasing this value may resolve startup issues on some slower machines (default: 120 seconds)`,
      tags: [],
      isDisabled: false,
      requiresRestart: false,
      defaultValue: 120,
      placeholder: ``,
      updateValue: (newValue) => {
        if (!chain) {
          return;
        }
        this._backendService.sendAndWait<boolean>('apps:market:market:setSetting', `network.timeout`, newValue).pipe(
          catchError(() => of(false)),
          concatMap(success => iif(
            () => !success,
            defer(() => this._snackbar.open(TextContent.SAVE_FAILED.replace('{setting}', 'Startup Timeout'), 'warn')),
            defer(() => this._store.dispatch(new MarketUserActions.SetSetting('startupWaitTimeoutSeconds', newValue)))
          )),
        ).subscribe();
      },
      value: isBasicObjectType(networkSettings) && isBasicObjectType(networkSettings.network) && typeof networkSettings.network.timeout === 'number' ? networkSettings.network.timeout : 120,
    };
    const numTimeoutDetails: NumberSettingDetails = {
      min: 20,
      max: 900,
      step: 1
    };
    const numTimeoutComp = this.connectionsContainer.createComponent(numberFactory);
    numTimeoutComp.instance.details = numTimeoutDetails;
    numTimeoutComp.instance.setting = numTimeoutSettings;

    const txUrl = networkSettings.urls && (typeof networkSettings.urls.transaction === 'string') ?
      networkSettings.urls.transaction || '' :
      (
        Object.prototype.toString.call(networkSettings.urls.transaction) === '[object Object]' && typeof networkSettings.urls.transaction[chain] === 'string' ?
          networkSettings.urls.transaction[chain] || '' :
          ''
      );

    const urlTransactionComp = this.urlsContainer.createComponent(urlFactory);
    const urlTransactionSettings: SettingField<string> = {
      title: `Transaction URL, for chain: ${chain}`,
      description: `The external URL of the block explorer for referencing transaction-related details. Leave empty to disable. Use the parameter {txid} that will be substituted with the actual transaction ID.`,
      tags: [`${chain} chain`],
      isDisabled: !chain,
      requiresRestart: false,
      defaultValue: '',
      placeholder: 'Block explorer Transaction lookup URL',
      updateValue: (newValue) => {
        if (!chain) {
          return;
        }

        this._backendService.sendAndWait<boolean>('apps:market:market:setSetting', `urls.transaction.${chain}`, newValue).pipe(
          catchError(() => of(false)),
          concatMap(success => iif(
            () => !success,
            defer(() => {
              urlTransactionComp.instance.errorMsg = TextContent.INLINE_ERROR_URL;
              this._cdr.detectChanges();
              this._snackbar.open(TextContent.SAVE_FAILED.replace('{setting}', 'transaction URL'), 'warn');
            }),
            defer(() => this._store.dispatch(new MarketUserActions.SetSetting('txUrl', newValue)))
          )),
        ).subscribe();
      },
      value: txUrl,
    };
    const urlTransactionDetails: URLSettingDetails = {
      allowEmpty: true
    };
    urlTransactionComp.instance.details = urlTransactionDetails;
    urlTransactionComp.instance.setting = urlTransactionSettings;
  }
}
