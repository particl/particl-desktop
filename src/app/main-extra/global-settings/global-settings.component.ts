import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { defer, iif, merge, of, Subject } from 'rxjs';
import { catchError, concatMap, finalize, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';
import { GlobalActions } from 'app/core/app-global-state/app.actions';
import { ApplicationConfigStateModel, IPCResponseApplicationSettings } from 'app/core/app-global-state/state.models';

import { BackendService } from 'app/core/services/backend.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { ApplicationRestartModalComponent } from 'app/main/components/application-restart-modal/application-restart-modal.component';
import { TermsConditionsModalComponent } from './terms-conditions-modal/terms-conditions-modal.component';


interface Setting<T = any> {
  id_backend: string;
  id_state: string;
  title: string;
  description: string;
  isDisabled: boolean;
  errorMsg?: string;
  options?: { text: string; value: string; isDisabled: boolean; }[];
  currentValue: T;
  tags: string[];
  restartRequired: boolean;
  formatValue?: (value: any) => T;
  type: 'select' | 'label';
}

enum TextContent {
  SAVE_SETTING_SUCCESSFUL = 'Successfully applied changes for {setting}',
  SAVE_SETTING_FAILED = 'Could not update {setting}. See logs for further details.',
  SAVE_FAILED = 'Failed to apply selected changes',
  FAILED_URL_REMOVE = 'Could not remove the selected URL',
  FAILED_URL_ADD = 'Could not add the provided URL',
  RESTARTING_APPLICATION = 'Please wait while the application restarts'
}

interface PageInfo {
  title: string;
  description: string;
  help: string;
}


@Component({
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalSettingsComponent implements OnInit, OnDestroy {
  settings: Setting[] = [];

  readonly customURLS: string[] = [];

  controlCustomUrlAdd: FormControl = new FormControl('', [
    Validators.required,
    // tslint:disable-next-line
    Validators.pattern("(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+$")
  ]);

  controlToggleUpdates: FormControl = new FormControl(true);

  readonly pageDetails: PageInfo = {
    title: 'Particl Desktop Settings',
    description: 'Adjust settings and configuration that apply to the whole Particl Desktop app',
    help: 'For configuration of separate wallets, open the specific wallet and go to Wallet Settings page'
  } as PageInfo;


  private destroy$: Subject<void> = new Subject();


  constructor(
    private _store: Store,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService,
    private _backendService: BackendService,
    private _cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {
    this.settings = this.buildSettingsItems();

    merge(
      this._store.select<ApplicationConfigStateModel>(ApplicationConfigState).pipe(
        tap({
          next: (settings) => {
            this.settings.forEach(s => {
              if (s.id_state in settings) {
                if (s.formatValue) {
                  s.currentValue = s.formatValue(settings[s.id_state]);
                } else {
                  s.currentValue = settings[s.id_state];
                }
              }
            });
            this._cdr.detectChanges();
          }
        }),
        takeUntil(this.destroy$)
      ),

      // frontend doesn't store various settings (eg: the external allowed URLs), so need this to fetch the additional settings
      this._backendService.sendAndWait<IPCResponseApplicationSettings>('application:settings').pipe(
        take(1),
        tap({
          next: (settings) => {
            if (settings) {
              if (Array.isArray(settings.ALLOWED_EXTERNAL_URLS)) {
                settings.ALLOWED_EXTERNAL_URLS.forEach(url => {
                  if (typeof url === 'string' && url.length > 0) {
                    this.customURLS.push(url);
                  }
                });
              }

              if (typeof settings.APPLICATION_UPDATES_ALLOWED === 'boolean') {
                this.controlToggleUpdates.setValue(settings.APPLICATION_UPDATES_ALLOWED, {onlySelf: true, emitEvent: false});
              }

              this._cdr.detectChanges();
            }
          }
        })
      ),

      // listen for, and respond to, app-update toggle changes
      this.controlToggleUpdates.valueChanges.pipe(
        tap({
          next: newValue => this.controlToggleUpdates.disable({onlySelf: true, emitEvent: false})
        }),
        switchMap(newValue =>
          this._backendService.sendAndWait<boolean>('application:setSetting', 'APPLICATION_UPDATES_ALLOWED', newValue
        ).pipe(
          catchError(() => of(false)),
          tap({
            next: success => {
              if (!success) {
                this._snackbar.open(TextContent.SAVE_SETTING_FAILED.replace('{setting}', 'Application Updates'));
                this.controlToggleUpdates.setValue(!newValue, {onlySelf: true, emitEvent: false});
              }
              this.controlToggleUpdates.enable({onlySelf: true, emitEvent: false});
            }
          })
        )),
        takeUntil(this.destroy$)
      )

    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackBySettingFn(_: number, item: Setting) {
    return item.id_backend;
  }


  actionShowTerms() {
    this._dialog.open(TermsConditionsModalComponent);
  }


  settingChangedValue(settingIdx: number) {
    if (!(settingIdx >= 0 && settingIdx < this.settings.length)) {
        return;
    }

    let newValue = this.settings[settingIdx].currentValue;
    if (this.settings[settingIdx].formatValue) {
      newValue = this.settings[settingIdx].formatValue(newValue);
    }
    this._backendService.sendAndWait<boolean>(
      'application:setSetting',
      this.settings[settingIdx].id_backend,
      this.settings[settingIdx].currentValue
    ).pipe(
      concatMap((isSaved) => iif(
        () => isSaved,
        defer(() => this._store.dispatch(
          new GlobalActions.SetSetting(this.settings[settingIdx].id_state, this.settings[settingIdx].currentValue)
        ).pipe(catchError(() => of(true)))),
        defer(() => of(false)),
      ))
    ).subscribe({
      next: (success) => {
        if (success) {
          this._snackbar.open(TextContent.SAVE_SETTING_SUCCESSFUL.replace('{setting}', this.settings[settingIdx].title));
          this.settings[settingIdx].errorMsg = '';
          if (this.settings[settingIdx].restartRequired) {
            this.actionRestartApplication();
          }
        } else {
          this.settings[settingIdx].errorMsg = 'Setting not saved',
          this._snackbar.open(TextContent.SAVE_SETTING_FAILED.replace('{setting}', this.settings[settingIdx].title), 'warn');
        }
      },
      error: () => {
        this._snackbar.open(TextContent.SAVE_SETTING_FAILED.replace('{setting}', this.settings[settingIdx].title), 'warn');
      }
    });
  }


  actionRemoveURL(index: number): void {
    if (index >= this.customURLS.length || index < 0) {
      return;
    }
    this.controlCustomUrlAdd.disable();

    const selectedUrl = this.customURLS[index];

    this._backendService.sendAndWait('application:setSetting', 'ALLOWED_EXTERNAL_URLS', null, selectedUrl).pipe(
      finalize(() => this.controlCustomUrlAdd.enable()),
      catchError(() => of(false)),
      tap({
        next: (success) => {
          if (success === true) {
            this.customURLS.splice(index, 1);
            return;
          }
          this._snackbar.open(TextContent.FAILED_URL_REMOVE);
        }
      })
    ).subscribe();
  }


  actionAddURL(): void {
    if (this.controlCustomUrlAdd.disabled || this.controlCustomUrlAdd.invalid) {
      return;
    }

    const newUrl = this.controlCustomUrlAdd.value;

    this._backendService.sendAndWait('application:setSetting', 'ALLOWED_EXTERNAL_URLS', newUrl).pipe(
      finalize(() => this.controlCustomUrlAdd.enable()),
      catchError((e) => of(false)),
      tap({
        next: (success) => {
          if (success === true) {
            this.customURLS.push(newUrl);
            this.controlCustomUrlAdd.setValue('');
            return;
          }
          this._snackbar.open(TextContent.FAILED_URL_ADD);
        }
      })
    ).subscribe();

  }


  private actionRestartApplication() {
    const dialogRef = this._dialog.open(ApplicationRestartModalComponent);
    dialogRef.componentInstance.onConfirmation.subscribe(() => {
      this._dialog.open(ProcessingModalComponent, {
        disableClose: true,
        data: {
          message: TextContent.RESTARTING_APPLICATION
        }
      });
    });
  }


  private buildSettingsItems(): Setting[] {

    const userSettings: Setting[] = [
      {
        id_backend: 'LANGUAGE',
        id_state: 'selectedLanguage',
        title: 'Language',
        description: 'Particl Desktop\'s current language',
        isDisabled: false,
        errorMsg: '',
        currentValue: null,
        restartRequired: false,
        tags: [],
        options: [
          {text: 'English (US)', value: 'en-US', isDisabled: false},
        ],
        type: 'select',
      },
      {
        id_backend: 'DEBUGGING_LEVEL',
        id_state: 'debugLevel',
        title: 'Debug Level',
        description: 'Change the current logging level. NOTE: changing this only applies to the current session and does not persist across application restarts.',
        isDisabled: false,
        errorMsg: '',
        currentValue: null,
        restartRequired: false,
        tags: [],
        options: [
          {text: 'silly', value: 'silly', isDisabled: false},
          {text: 'debug', value: 'debug', isDisabled: false},
          {text: 'info', value: 'info', isDisabled: false},
          {text: 'warn', value: 'warn', isDisabled: false},
          {text: 'error', value: 'error', isDisabled: false},
        ],
        type: 'select',
      },
      {
        id_backend: 'TESTING_MODE',
        id_state: 'requestedTestingNetworks',
        title: 'Requested network testing mode',
        description: 'Indicates if the application has requested blockchain networks to force start in testing mode (typically this means the blockchain network would start using a test network).',
        isDisabled: false,
        errorMsg: '',
        currentValue: null,
        restartRequired: false,
        tags: ['info'],
        type: 'label',
        formatValue: (val) => val === true ? 'Yes' : 'No',
      },
      {
        id_backend: 'MODE',
        id_state: 'buildMode',
        title: 'Build Mode',
        description: 'The current build mode of the application',
        isDisabled: false,
        errorMsg: '',
        currentValue: null,
        restartRequired: false,
        tags: ['info'],
        type: 'label',
      }
    ];

    return userSettings;
  }

}
