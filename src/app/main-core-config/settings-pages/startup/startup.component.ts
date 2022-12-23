import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge, Subject } from 'rxjs';
import { concatMap, filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';
import { ApplicationConfigStateModel } from 'app/core/app-global-state/state.models';

import { BackendService } from 'app/core/services/backend.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { CoreConfigurationService, Settings } from '../../core-config.service';


enum TextContent {
  SETTING_UPDATE_FAILED = 'Failed to change the setting',
}

enum Controls {
  autostart = 'startup.autoStart',
  startnew = 'startup.startNewInstance',
  network_main = 'network.mainnet',
  network_test = 'network.testnet',
  network_regtest = 'network.regtest',
  datadir = 'datadir',
}


@Component({
  templateUrl: './startup.component.html',
  styleUrls: ['./startup.component.scss']
})
export class StartupComponent implements OnInit, OnDestroy {

  controlAutoStart: FormControl = new FormControl({ value: false, disabled: true});
  controlStartNew: FormControl = new FormControl({ value: false, disabled: true});
  controlNetwork: FormControl = new FormControl({ value: '', disabled: true});
  controlDataDir: FormControl = new FormControl({ value: '', disabled: true});

  allowEditingNetwork: boolean = false;

  private destroy$: Subject<void> = new Subject();


  constructor(
    private _store: Store,
    private _coreConfigService: CoreConfigurationService,
    private _snackbar: SnackbarService,
    private _backendService: BackendService,
  ) { }


  ngOnInit(): void {

    this.allowEditingNetwork = !this._store.selectSnapshot<ApplicationConfigStateModel>(ApplicationConfigState).requestedTestingNetworks;

    const settings$ = this._coreConfigService.getSettings().pipe(
      filter(settings => settings !== null),
      tap({
        next: (settings) => this.loadSettings(settings)
      }),
      takeUntil(this.destroy$)
    );

    const updates$ = merge(

      this.controlAutoStart.valueChanges.pipe(
        concatMap((value) => this._coreConfigService.setSetting({[Controls.autostart]: value})),
        tap({
          next: success => {
            if (!success) {
              this._snackbar.open(TextContent.SETTING_UPDATE_FAILED);
              this.controlAutoStart.setValue(!this.controlAutoStart.value, {onlySelf: true, emitEvent: false});
            }
          }
        }),
        takeUntil(this.destroy$)
      ),

      this.controlStartNew.valueChanges.pipe(
        concatMap((value) => this._coreConfigService.setSetting({[Controls.startnew]: value})),
        tap({
          next: success => {
            if (!success) {
              this._snackbar.open(TextContent.SETTING_UPDATE_FAILED);
              this.controlStartNew.setValue(!this.controlStartNew.value, {onlySelf: true, emitEvent: false});
            }
          }
        }),
        takeUntil(this.destroy$)
      ),

      this.controlNetwork.valueChanges.pipe(
        map((value) => {
          const updatedValue = {
            [Controls.network_main]: false,
            [Controls.network_test]: false,
            [Controls.network_regtest]: false,
          };
          switch (value) {
            case 'main': updatedValue[Controls.network_main] = true; break;
            case 'test': updatedValue[Controls.network_test] = true; break;
            case 'regtest': updatedValue[Controls.network_regtest] = true; break;
          }
          return updatedValue;
        }),
        concatMap((values) => this._coreConfigService.setSetting(values)),
        tap({
          next: success => {
            if (!success) {
              this._snackbar.open(TextContent.SETTING_UPDATE_FAILED);
            }
          }
        }),
        takeUntil(this.destroy$)
      ),

      this.controlDataDir.valueChanges.pipe(
        concatMap((value) => this._coreConfigService.setSetting({[Controls.datadir]: value})),
        tap({
          next: success => {
            if (!success) {
              this._snackbar.open(TextContent.SETTING_UPDATE_FAILED);
            }
          }
        }),
        takeUntil(this.destroy$)
      )
    ).pipe(
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


  actionSelectDataDir(): void {
    this._backendService.sendAndWait<string>(
      'gui:gui:open-dialog',
      {
        modalType: 'OpenDialog',
        modalOptions: {
          title: 'Select Custom Data Directory',
          buttonLabel : 'Select',
          properties: ['createDirectory', 'openDirectory'],
        }
      }
    ).pipe(
      take(1),
      tap({
        next: dir => {
          if (!dir || !Array.isArray(dir) || dir.length === 0 || typeof dir[0] !== 'string') {
            return;
          }
          this.controlDataDir.setValue(dir[0]);
        }
      })
    ).subscribe();
  }


  actionClearSelectDataDir(): void {
    if (this.controlDataDir.value !== '') {
      this.controlDataDir.setValue('');
    }
  }


  private loadSettings(settings: Settings): void {
    if (settings[Controls.autostart]) {
      this.controlAutoStart.setValue(settings[Controls.autostart].value, {onlySelf: true, emitEvent: false});
      this.controlAutoStart.enable({emitEvent: false});
    }

    if (settings[Controls.startnew]) {
      this.controlStartNew.setValue(settings[Controls.startnew].value, {onlySelf: true, emitEvent: false});
      this.controlStartNew.enable({emitEvent: false});
    }

    let networkSelection = 'main';
    if (!this.allowEditingNetwork) {
      networkSelection = 'test';
    } else {
      if (settings[Controls.network_main] || settings[Controls.network_test] || settings[Controls.network_regtest]) {
        switch (true) {
          case settings[Controls.network_main] && settings[Controls.network_main].value: networkSelection = 'main'; break;
          case settings[Controls.network_test] && settings[Controls.network_test].value: networkSelection = 'test'; break;
          case settings[Controls.network_regtest] && settings[Controls.network_regtest].value: networkSelection = 'regtest'; break;
        }
      }
    }
    this.controlNetwork.setValue(networkSelection, {onlySelf: true, emitEvent: false});
    if(this.allowEditingNetwork) {
      this.controlNetwork.enable({emitEvent: false});
    }

    if (settings[Controls.datadir]) {
      this.controlDataDir.setValue(settings[Controls.datadir].value, {onlySelf: true, emitEvent: false});
    }
  }

}
