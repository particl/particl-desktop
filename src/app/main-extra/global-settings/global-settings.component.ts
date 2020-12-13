import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';
import { take, concatMap, finalize } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { ApplicationRestartModalComponent } from 'app/main/components/application-restart-modal/application-restart-modal.component';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { AppSettings } from 'app/core/store/app.actions';

import {
  PageInfo,
  TextContent,
  SettingType,
  SettingGroup,
  Setting,
  SelectableOption
} from 'app/main-extra/global-settings/settings.types';
import { ApplicationState } from 'app/core/store/app.state';


@Component({
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss']
})
export class GlobalSettingsComponent implements OnInit {
  settingType: (typeof SettingType) = SettingType;  // Template typings

  settingGroups: SettingGroup[] = [];
  isProcessing: boolean = false;   // Indicates that the current page is busy processing a change.
  currentChanges: number[][] = []; // (convenience helper) Tracks which setting items on the current page have changed

  readonly pageDetails: PageInfo = {
    title: 'Particl Desktop Settings',
    description: 'Adjust settings and configuration that apply to the whole Particl Desktop app',
    help: 'For configuration of separate wallets, open the specific wallet and go to Wallet Settings page'
  } as PageInfo;

  private _currentGroupIdx: number = 0;


  constructor(
    private _store: Store,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService
  ) { }


  ngOnInit() {
    this.loadPageData();

    // Perform relevant data binding
    this.settingGroups.forEach((group: SettingGroup) => {
      group.settings.forEach((setting: Setting) => {
        if (setting.validate) {
          setting.validate = setting.validate.bind(this);
        }
        if (setting.onChange) {
          setting.onChange = setting.onChange.bind(this);
        }
      });

      this.currentChanges.push([]);
    });
    this.clearChanges();
  }


  get hasErrors(): boolean {
    return this.settingGroups.findIndex(group => group.errors.length > 0) > -1;
  }

  get hasChanges(): boolean {
    return this.currentChanges.findIndex(group => group.length > 0) > -1;
  }


  get currentGroup(): SettingGroup {
    return this.settingGroups[this._currentGroupIdx];
  }

  get currentGroupIdx(): number {
    return this._currentGroupIdx;
  }


  trackBySettingGroupFn(idx: number, item: SettingGroup) {
    return idx;
  }


  trackBySettingFn(idx: number, item: Setting) {
    return item.id;
  }


  changeSelectedGroup(idx: number) {
    if (idx >= 0 && idx < this.settingGroups.length) {
      this._currentGroupIdx = idx;
    }
  }


  settingChangedValue(settingIdx: number) {
    if (!(settingIdx >= 0 && settingIdx < this.currentGroup.settings.length)) {
        return;
    }

    this.isProcessing = true;
    const currentGroup = this.currentGroup;
    const groupIdx = this._currentGroupIdx;
    const setting = this.currentGroup.settings[settingIdx];

    if (setting.validate) {
      const response = setting.validate(setting.newValue, setting);
      setting.errorMsg = response ? response : '';
    }
    if (!setting.errorMsg && setting.onChange) {
      const response = setting.onChange(setting.newValue, setting);
      setting.errorMsg = response ? response : '';
    }
    const listedError = currentGroup.errors.findIndex(errItem => errItem === settingIdx);

    if (setting.errorMsg && (listedError === -1)) {
      currentGroup.errors.push(settingIdx);
    } else if (!setting.errorMsg && (listedError > -1)) {
      currentGroup.errors.splice(listedError, 1);
    }

    const changeIdx = this.currentChanges[groupIdx].findIndex((c) => c === settingIdx);

    if ((setting.currentValue !== setting.newValue) && (changeIdx === -1)) {
      this.currentChanges[groupIdx].push(settingIdx);
    } else if ((setting.currentValue === setting.newValue) && (changeIdx !== -1)) {
      this.currentChanges[groupIdx].splice(changeIdx, 1);
    }

    this.isProcessing = false;
  }


  clearChanges() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    this.settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        if ( !(setting.type === SettingType.BUTTON)) {
          setting.newValue = setting.currentValue;
        }
        setting.errorMsg = '';
        group.errors = [];
      });
    });

    this.currentChanges = this.currentChanges.map(change => []);
    this.isProcessing = false;
  }

  /**
   * Saves all modified changes on the current displayed page/tab.
   * Validates each modified setting if a validate function is specified.
   * If no setting validation errors occur, then the SettingPages's "save" function is invoked.
   */
  saveChanges() {
    if (this.isProcessing) {
      this._snackbar.open(TextContent.ERROR_BUSY_PROCESSING, 'err');
      return;
    }
    this.isProcessing = true;

    this.disableUI(TextContent.SAVING);

    // Validation of each changed setting ensures current settings are not in an error state
    let hasError = false;
    let hasChanged = false;
    this.settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        if ( !(setting.type === SettingType.BUTTON)) {
          if (setting.currentValue !== setting.newValue) {
            hasChanged = true;

            if (setting.validate) {
              const response = setting.validate(setting.newValue, setting);
              if (response) {
                setting.errorMsg = response;
                hasError = true;
              }
            }
          }
        }
      });
    });

    if (!hasChanged || hasError) {
      const errMsg = !hasChanged ? TextContent.SAVE_NOT_NEEDED : TextContent.ERROR_INVALID_ITEMS;
      this.isProcessing = false;
      this.enableUI();
      this._snackbar.open(errMsg, 'err');
      return;
    }

    this.saveActualChanges().pipe(
      take(1),
      finalize(() => {
        this.isProcessing = false;
        this.enableUI();
      })
    ).subscribe(
      (doRestart: boolean) => {

        // Change current settings in case it has not been done
        this.settingGroups.forEach(group => {
          group.settings.forEach(setting => {
            if ( !(setting.type === SettingType.BUTTON)) {
              setting.currentValue = setting.newValue;
            }
            setting.errorMsg = '';
          });
          group.errors = [];
        });

        // reset the list of current changes
        this.currentChanges = this.currentChanges.map(change => []);
        this._snackbar.open(TextContent.SAVE_SUCCESSFUL);

        if (doRestart) {
          this.actionRestartApplication();
        }
      },
      (err) => {
        this._snackbar.open(TextContent.SAVE_FAILED, 'err');
      }
    );
  }


  private disableUI(message: string) {
    this._dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: message
      }
    });
  }


  private enableUI() {
    this._dialog.closeAll();
  }

  /**
   * Extracts the changed settings for persistence: Modify this depending on the specific settings being configured
   */
  private saveActualChanges(): Observable<boolean> {
    return new Observable((observer) => {

      let restartRequired = false;
      const actions = [];

      this.settingGroups.forEach(group => {
        group.settings.forEach((setting) => {
          if ( (setting.type !== SettingType.BUTTON) && (setting.currentValue !== setting.newValue)) {
            actions.push(new AppSettings.SetSetting(setting.id, setting.newValue));
            if (setting.restartRequired) {
              restartRequired = true;
            }
          }
        });
      });

      from(actions).pipe(
        concatMap((action) => this._store.dispatch(action))
      ).subscribe(
        null,
        null,
        () => {
          observer.next(restartRequired);
          observer.complete();
        }
      );
    });
  }


  private actionRestartApplication() {
    const dialogRef = this._dialog.open(ApplicationRestartModalComponent);
    dialogRef.componentInstance.onConfirmation.subscribe(() => {
      this.disableUI(TextContent.RESTARTING_APPLICATION);
    });
  }


  private loadPageData() {


    const globalSettings = this._store.selectSnapshot(ApplicationState.appSettings);

    const userInterface = {
      name: 'User interface',
      icon: 'part-select',
      settings: [],
      errors: []
    } as SettingGroup;

    userInterface.settings.push({
      id: 'global.language',
      title: 'Language',
      description: 'Change the application language',
      isDisabled: true,
      type: SettingType.SELECT,
      errorMsg: '',
      currentValue: globalSettings.language,
      tags: [],
      options: [
        {
          text: 'English (US)',
          value: 'en_us',
          isDisabled: true
        } as SelectableOption
      ],
      restartRequired: false
    } as Setting);


    const coreNetConfig = {
      name: 'Core network connection',
      icon: 'part-globe',
      settings: [],
      errors: []
    } as SettingGroup;

    coreNetConfig.settings.push({
      id: 'core.network.upnp',
      title: 'Enable UPnP',
      description: 'Use UPnP to map the listening port',
      isDisabled: false,
      type: SettingType.BOOLEAN,
      errorMsg: '',
      currentValue: globalSettings.upnp,
      tags: [],
      restartRequired: true
    } as Setting);

    coreNetConfig.settings.push({
      id: 'core.network.proxy',
      title: 'Connect via Proxy',
      description: 'Directs core to connect via a SOCKS5 proxy.',
      isDisabled: false,
      type: SettingType.STRING,
      limits: {placeholder: 'e.g. 127.0.0.1:9050 for Tor'},
      errorMsg: '',
      currentValue: globalSettings.proxy,
      tags: [],
      restartRequired: true,
      validate: this.validateIPAddressPort
    } as Setting);

    this.settingGroups.push(userInterface);
    this.settingGroups.push(coreNetConfig);
  }

  private validateIPAddressPort(value: any, setting: Setting): string | null {
    const strVal = String(value);
    if (strVal.length === 0) {
      return null;
    }
    const parts = strVal.split(':');
    const octs = String(parts[0]).split('.');
    let isValid = (
      (octs.length === 4) &&
      (octs.find(oct => !isFinite(+oct) || (+oct > 255) || (+oct < 0) || (oct.length === 0)
    ) === undefined) );

    if (parts[1]) {
      const port = +(String(parts[1]));
      isValid = isValid && (port > 0) && (port <= 65535);
    } else if (!parts[1] && strVal.includes(':')) {
      isValid = false;
    }

    if (!isValid) {
      return 'Invalid IPv4 address and/or port';
    }

    return null;
  }

}
