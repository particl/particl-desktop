import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';

import { ApplicationConfigState } from 'app/core/app-global-state/app.state';
import { ApplicationConfigStateModel } from 'app/core/app-global-state/state.models';

import { BackendService } from 'app/core/services/backend.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { ApplicationRestartModalComponent } from 'app/main/components/application-restart-modal/application-restart-modal.component';
import { TermsConditionsModalComponent } from './terms-conditions-modal/terms-conditions-modal.component';
import { catchError, concatMap, takeUntil, tap } from 'rxjs/operators';
import { GlobalActions } from 'app/core/app-global-state/app.actions';
import { defer, iif, of, Subject } from 'rxjs';


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
  type: 'select' | 'label',
}

enum TextContent {
  SAVE_SETTING_SUCCESSFUL = 'Successfully applied changes for {setting}',
  SAVE_SETTING_FAILED = 'Could not update {setting}. See logs for further details.',
  SAVE_FAILED = 'Failed to apply selected changes',
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
        defer(() => this._store.dispatch(new GlobalActions.SetSetting(this.settings[settingIdx].id_state, this.settings[settingIdx].currentValue)).pipe(catchError(() => of(true)))),
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
