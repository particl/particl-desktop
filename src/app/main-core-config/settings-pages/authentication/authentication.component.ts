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
  rpcUseCookie = 'authentication.useCookie',
  rpcUser = 'authentication.rpcUser',
  rpcPass = 'authentication.rpcPass',
}


@Component({
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class AuthenticationComponent implements OnInit, OnDestroy {

  controluseCookie: FormControl = new FormControl({ value: false, disabled: true});
  controlRpcUser: FormControl = new FormControl(
    { value: '', disabled: true },
    {validators: [Validators.required, Validators.maxLength(50)], updateOn: 'blur'}
  );
  controlRpcPass: FormControl = new FormControl(
    { value: '', disabled: true},
    {validators: [Validators.required, Validators.maxLength(100)], updateOn: 'blur'}
  );

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

      this.controluseCookie.valueChanges.pipe(
        concatMap((value) => this._coreConfigService.setSetting({[Controls.rpcUseCookie]: value})),
        takeUntil(this.destroy$)
      ),

      this.controlRpcUser.valueChanges.pipe(
        concatMap((value) => iif(
          () => this.controlRpcUser.valid,
          defer(() => this._coreConfigService.setSetting({[Controls.rpcUser]: value})),
          defer(() => of(false))
        )),
        takeUntil(this.destroy$)
      ),

      this.controlRpcPass.valueChanges.pipe(
        concatMap((value) => iif(
          () => this.controlRpcPass.valid,
          defer(() => this._coreConfigService.setSetting({[Controls.rpcPass]: value})),
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
    if (settings[Controls.rpcUseCookie]) {
      this.controluseCookie.setValue(settings[Controls.rpcUseCookie].value, {onlySelf: true, emitEvent: false});
      this.controluseCookie.enable({emitEvent: false});
    }

    if (settings[Controls.rpcUser]) {
      this.controlRpcUser.setValue(settings[Controls.rpcUser].value, {onlySelf: true, emitEvent: false});
      if (this.controluseCookie.value) {
        this.controlRpcUser.disable({onlySelf: true, emitEvent: false});
      } else {
        this.controlRpcUser.enable({onlySelf: true, emitEvent: false});
        this.controlRpcUser.updateValueAndValidity({onlySelf: true, emitEvent: false});
      }
    }

    if (settings[Controls.rpcPass]) {
      this.controlRpcPass.setValue(settings[Controls.rpcPass].value, {onlySelf: true, emitEvent: false});
      if (this.controluseCookie.value) {
        this.controlRpcPass.disable({onlySelf: true, emitEvent: false});
      } else {
        this.controlRpcPass.enable({onlySelf: true, emitEvent: false});
        this.controlRpcUser.updateValueAndValidity({onlySelf: true, emitEvent: false});
      }
    }
  }

}
