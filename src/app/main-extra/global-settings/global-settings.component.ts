import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';

import { ApplicationConfigState } from 'app/core/app-global-state/app.state';
import { ApplicationConfigStateModel } from 'app/core/app-global-state/state.models';

import { BackendService } from 'app/core/services/backend.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { ApplicationRestartModalComponent } from 'app/main/components/application-restart-modal/application-restart-modal.component';
import { TermsConditionsModalComponent } from './terms-conditions-modal/terms-conditions-modal.component';

import { PageInfo, TextContent, Setting } from 'app/main-extra/global-settings/settings.types';


type StatusType = Pick<Setting, 'id' | 'title' | 'description' | 'isDisabled' | 'errorMsg' | 'currentValue' | 'restartRequired' | 'tags' | 'options' | 'formatValue'>;


@Component({
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss']
})
export class GlobalSettingsComponent implements OnInit {
  settings: StatusType[] = [];

  readonly pageDetails: PageInfo = {
    title: 'Particl Desktop Settings',
    description: 'Adjust settings and configuration that apply to the whole Particl Desktop app',
    help: 'For configuration of separate wallets, open the specific wallet and go to Wallet Settings page'
  } as PageInfo;




  constructor(
    private _store: Store,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService,
    private _backendService: BackendService,
  ) { }


  ngOnInit() {
    this.settings = this.buildSettingsItems();
  }


  trackBySettingFn(_: number, item: Setting) {
    return item.id;
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
      'application:settings',
      true,
      this.settings[settingIdx].id,
      this.settings[settingIdx].currentValue
    ).subscribe({
      next: (success) => {
        if (success) {
          this._snackbar.open(TextContent.SAVE_SETTING_SUCCESSFUL.replace('{setting}', this.settings[settingIdx].title));
          if (this.settings[settingIdx].restartRequired) {
            this.actionRestartApplication();
          }
        } else {
          this._snackbar.open(TextContent.SAVE_SETTING_FAILED.replace('{setting}', this.settings[settingIdx].title), 'err');
        }
      },
      error: () => {
        this._snackbar.open(TextContent.SAVE_SETTING_FAILED.replace('{setting}', this.settings[settingIdx].title), 'err');
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


  private buildSettingsItems(): StatusType[] {

    const globalSettings = this._store.selectSnapshot<ApplicationConfigStateModel>(ApplicationConfigState);

    const userSettings: StatusType[] = [
      {
        id: 'LANGUAGE',
        title: 'Language',
        description: 'Particl Desktop\'s current language',
        isDisabled: true,
        errorMsg: '',
        currentValue: globalSettings.selectedLanguage,
        restartRequired: false,
        tags: [],
        options: [
          {text: 'English (US)', value: 'en-US', isDisabled: false},
        ],
      },
      {
        id: 'DEBUGGING_LEVEL',
        title: 'Debug Level',
        description: 'Indicates the level at which various events are logged',
        isDisabled: true,
        errorMsg: '',
        currentValue: globalSettings.debugLevel,
        restartRequired: false,
        tags: [],
        options: [
          {text: 'silly', value: 'silly', isDisabled: false},
          {text: 'debug', value: 'debug', isDisabled: false},
          {text: 'info', value: 'info', isDisabled: false},
          {text: 'warn', value: 'warn', isDisabled: false},
          {text: 'error', value: 'error', isDisabled: false},
        ],
      },
      {
        id: 'TESTING_MODE',
        title: 'Requested network testing mode',
        description: 'Determines whether or not blockchain networks have been requested to start in testing mode or not.',
        isDisabled: true,
        errorMsg: '',
        currentValue: globalSettings.requestedTestingNetworks ? 'true' : 'false',
        restartRequired: true,
        tags: [],
        options: [
          {text: 'Yes', value: 'true', isDisabled: false},
          {text: 'No', value: 'false', isDisabled: false},
        ],
        formatValue: (selectedValue) => selectedValue === 'true'
      }
    ];

    return userSettings;
  }

}
