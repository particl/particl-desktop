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
  coreAutoUpdate = 'startup.autoUpdate',
  coreDownloadTimeout = 'startup.downloadTimeout',
}


@Component({
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.scss']
})
export class UpdatesComponent implements OnInit, OnDestroy {

  controlCoreAutoUpdate: FormControl = new FormControl({ value: false, disabled: true});
  controlDownloadTimeout: FormControl = new FormControl({ value: 0, disabled: true}, {updateOn: 'blur'});

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

      this.controlCoreAutoUpdate.valueChanges.pipe(
        concatMap((value) => this._coreConfigService.setSetting({[Controls.coreAutoUpdate]: value})),
        tap({
          next: success => {
            if (!success) {
              this._snackbar.open(TextContent.SETTING_UPDATE_FAILED);
            }
          }
        }),
        takeUntil(this.destroy$)
      ),

      this.controlDownloadTimeout.valueChanges.pipe(
        concatMap((value) => iif(
          () => this.controlDownloadTimeout.valid,
          defer(() => this._coreConfigService.setSetting({[Controls.coreDownloadTimeout]: value})),
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
    if (settings[Controls.coreAutoUpdate]) {
      this.controlCoreAutoUpdate.setValue(settings[Controls.coreAutoUpdate].value, {onlySelf: true, emitEvent: false});
      this.controlCoreAutoUpdate.enable({emitEvent: false});
    }

    if (settings[Controls.coreDownloadTimeout]) {
      this.controlDownloadTimeout.setValue(settings[Controls.coreDownloadTimeout].value, {onlySelf: true, emitEvent: false});

      if (settings[Controls.coreDownloadTimeout].constraints) {
        const validators = [Validators.required];
        if (Number.isSafeInteger(settings[Controls.coreDownloadTimeout].constraints.min)) {
          validators.push(Validators.min(settings[Controls.coreDownloadTimeout].constraints.min));
        }
        if (Number.isSafeInteger(settings[Controls.coreDownloadTimeout].constraints.max)) {
          validators.push(Validators.max(settings[Controls.coreDownloadTimeout].constraints.max));
        }
        if (validators.length > 0) {
          this.controlDownloadTimeout.setValidators(validators);
        }

        this.controlDownloadTimeout.updateValueAndValidity({emitEvent: false});
      }

      this.controlDownloadTimeout.enable({onlySelf: true, emitEvent: false});
    }
  }

}
