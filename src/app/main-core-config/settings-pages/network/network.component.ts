import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { defer, iif, merge, of, Subject } from 'rxjs';
import { concatMap, filter, takeUntil, tap } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { CoreConfigurationService, Settings } from '../../core-config.service';

import { Store } from '@ngxs/store';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';
import { ApplicationConfigStateModel } from 'app/core/app-global-state/state.models';


enum TextContent {
  SETTING_UPDATE_FAILED = 'Failed to change the setting',
  NETWORK_LABEL_MAINNET = 'Mainnet',
  NETWORK_LABEL_TESTNET = 'Testnet',
  NETWORK_LABEL_REGTEST = 'RegTest',
}

enum Controls {
  rpcIP = 'coreHost',
  rpcPort = 'corePort',
  zmqIP = 'zmqHost',
  zmqPort = 'zmqPort',
  network_main = 'network.mainnet',
  network_test = 'network.testnet',
  network_regtest = 'network.regtest',
}

type NetworkPrefixType = 'mainnet' | 'testnet' | 'regtest' | '';
type NetworkPrefix = string;


@Component({
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit, OnDestroy {

  controlRpcIP: FormControl = new FormControl({ value: '', disabled: true}, {updateOn: 'blur'});
  controlRpcPort: FormControl = new FormControl({ value: 0, disabled: true}, {updateOn: 'blur'});
  controlZmqIP: FormControl = new FormControl({ value: '', disabled: true}, {updateOn: 'blur'});
  controlZmqPort: FormControl = new FormControl({ value: 0, disabled: true}, {updateOn: 'blur'});
  networkLabel: string = '';


  private destroy$: Subject<void> = new Subject();
  private allowMainNetwork: boolean = false;
  private controlNetworkPrefix: NetworkPrefix = '';


  constructor(
    private _store: Store,
    private _coreConfigService: CoreConfigurationService,
    private _snackbar: SnackbarService,
  ) { }


  ngOnInit(): void {

    this.allowMainNetwork = !this._store.selectSnapshot<ApplicationConfigStateModel>(ApplicationConfigState).requestedTestingNetworks;

    const settings$ = this._coreConfigService.getSettings().pipe(
      filter(settings => settings !== null),
      tap({
        next: (settings) => this.loadSettings(settings)
      }),
      takeUntil(this.destroy$)
    );

    const updates$ = merge(

      this.controlRpcIP.valueChanges.pipe(
        concatMap((value) => iif(
          () => this.controlRpcIP.valid,
          defer(() => this._coreConfigService.setSetting({[`${this.controlNetworkPrefix}${Controls.rpcIP}`]: value})),
          defer(() => of(false))
        )),
        takeUntil(this.destroy$)
      ),
      this.controlRpcPort.valueChanges.pipe(
        concatMap((value) => iif(
          () => this.controlRpcPort.valid,
          defer(() => this._coreConfigService.setSetting({[`${this.controlNetworkPrefix}${Controls.rpcPort}`]: value})),
          defer(() => of(false))
        )),
        takeUntil(this.destroy$)
      ),
      this.controlZmqIP.valueChanges.pipe(
        concatMap((value) => iif(
          () => this.controlZmqIP.valid,
          defer(() => this._coreConfigService.setSetting({[`${this.controlNetworkPrefix}${Controls.zmqIP}`]: value})),
          defer(() => of(false))
        )),
        takeUntil(this.destroy$)
      ),
      this.controlZmqPort.valueChanges.pipe(
        concatMap((value) => iif(
          () => this.controlZmqPort.valid,
          defer(() => this._coreConfigService.setSetting({[`${this.controlNetworkPrefix}${Controls.zmqPort}`]: value})),
          defer(() => of(false))
        )),
        takeUntil(this.destroy$)
      ),
    ).pipe(
      tap({
        next: success => {
          if (!success) {
            this._snackbar.open(TextContent.SETTING_UPDATE_FAILED);
          }
        }
      }),
      takeUntil(this.destroy$)
    );


    merge(
      settings$,
      updates$
    ).subscribe();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private loadSettings(settings: Settings): void {

    let selectedNetwork: NetworkPrefixType = '';
    if (settings[Controls.network_main] || settings[Controls.network_test] || settings[Controls.network_regtest]) {
      switch (true) {
        case this.allowMainNetwork && settings[Controls.network_main] && settings[Controls.network_main].value:
          selectedNetwork = 'mainnet';
          this.networkLabel = TextContent.NETWORK_LABEL_MAINNET;
          break;
        case settings[Controls.network_test] && settings[Controls.network_test].value:
          selectedNetwork = 'testnet';
          this.networkLabel = TextContent.NETWORK_LABEL_TESTNET;
          break;
        case settings[Controls.network_regtest] && settings[Controls.network_regtest].value:
          selectedNetwork = 'regtest';
          this.networkLabel = TextContent.NETWORK_LABEL_REGTEST;
          break;
        default:
          this.networkLabel = '';
      }
    }

    this.controlNetworkPrefix = selectedNetwork.length > 0 ? `${selectedNetwork}.` : '';

    for (const field of [Controls.rpcIP, Controls.rpcPort, Controls.zmqIP, Controls.zmqPort]) {
      const fieldName = `${this.controlNetworkPrefix}${field}`;

      if (settings[fieldName]) {
        let control: FormControl;
        switch (field) {
          case Controls.rpcIP: control = this.controlRpcIP; break;
          case Controls.rpcPort: control = this.controlRpcPort; break;
          case Controls.zmqIP: control = this.controlZmqIP; break;
          case Controls.zmqPort: control = this.controlZmqPort; break;
        }

        if (control) {
          control.setValue(settings[fieldName].value, {onlySelf: true, emitEvent: false});

          if (settings[fieldName].constraints) {
            const validators = [];
            if (settings[fieldName].constraints.pattern) {
              validators.push(Validators.pattern(settings[fieldName].constraints.pattern));
            }
            if (Number.isSafeInteger(settings[fieldName].constraints.min)) {
              validators.push(Validators.min(settings[fieldName].constraints.min));
            }
            if (Number.isSafeInteger(settings[fieldName].constraints.max)) {
              validators.push(Validators.max(settings[fieldName].constraints.max));
            }
            if (validators.length > 0) {
              control.setValidators(validators);
              control.updateValueAndValidity({onlySelf: true, emitEvent: false});
            }
          }
          control.enable({emitEvent: false});
        }
      }
    }
  }

}
