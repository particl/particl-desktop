import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { defer, iif, merge, of, Subject } from 'rxjs';
import { concatMap, filter, takeUntil, tap } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { CoreConfigurationService, Settings } from '../../core-config.service';


enum TextContent {
  SETTING_UPDATE_FAILED = 'Failed to change the setting',
}

enum Controls {
  useProxy = 'proxy.enabled',
  proxyAddress = 'proxy.url',
}


@Component({
  templateUrl: './proxy.component.html',
  styleUrls: ['./proxy.component.scss']
})
export class ProxyComponent implements OnInit, OnDestroy {

  controlUseProxy: FormControl = new FormControl({ value: false, disabled: true});
  controlProxyAddress: FormControl = new FormControl({ value: '', disabled: true}, {updateOn: 'blur'});

  private destroy$: Subject<void> = new Subject();


  constructor(
    private _coreConfigService: CoreConfigurationService,
    private _snackbar: SnackbarService,
  ) { }


  ngOnInit(): void {

    const settings$ = this._coreConfigService.getSettings().pipe(
      filter(settings => settings !== null),
      tap({
        next: (settings) => this.loadSettings(settings)
      }),
      takeUntil(this.destroy$)
    );

    const updates$ = merge(

      this.controlUseProxy.valueChanges.pipe(
        concatMap((value) => this._coreConfigService.setSetting({[Controls.useProxy]: value})),
        tap({
          next: success => {
            if (!success) {
              this._snackbar.open(TextContent.SETTING_UPDATE_FAILED);
            }
          }
        }),
        takeUntil(this.destroy$)
      ),

      this.controlProxyAddress.valueChanges.pipe(
        concatMap((value) => iif(
          () => this.controlProxyAddress.valid,
          defer(() => this._coreConfigService.setSetting({[Controls.proxyAddress]: value})),
          defer(() => of(false))
        )),
        tap({
          next: success => {
            if (!success) {
              this._snackbar.open(TextContent.SETTING_UPDATE_FAILED);
            }
          }
        }),
        takeUntil(this.destroy$)
      ),
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


  private loadSettings(settings: Settings): void {
    if (settings[Controls.useProxy]) {
      this.controlUseProxy.setValue(settings[Controls.useProxy].value, {onlySelf: true, emitEvent: false});
      this.controlUseProxy.enable({emitEvent: false});
    }

    if (settings[Controls.proxyAddress]) {
      if (settings[Controls.proxyAddress].constraints && settings[Controls.proxyAddress].constraints.pattern) {
        this.controlProxyAddress.setValidators(Validators.pattern(settings[Controls.proxyAddress].constraints.pattern));
      }
      this.controlProxyAddress.setValue(settings[Controls.proxyAddress].value, {onlySelf: true, emitEvent: false});

      if (this.controlUseProxy.value && this.controlProxyAddress.disabled) {
        this.controlProxyAddress.enable({onlySelf: true});
      } else if (!this.controlUseProxy.value && this.controlProxyAddress.enabled) {
        this.controlProxyAddress.disable({onlySelf: true});
      }
    }
  }

}
