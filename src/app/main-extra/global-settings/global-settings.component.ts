import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';
import { range } from 'lodash';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApplicationRestartModalComponent } from 'app/main/components/application-restart-modal/application-restart-modal.component';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { AppSettings } from 'app/core/store/app.actions';

import {
  Page,
  PageInfo,
  TextContent,
  SettingType,
  PageLoadFunction,
  SettingGroup,
  Setting,
  SelectableOption
} from 'app/main-extra/global-settings/settings.types';
import { ApplicationState } from 'app/core/store/app.state';


@Component({
  selector: 'main-settings',
  templateUrl: './global-settings.component.html',
  styleUrls: ['./global-settings.component.scss']
})
export class GlobalSettingsComponent implements OnInit, OnDestroy {
  public settingPages: Array<Page> = [];
  public isLoading: boolean = true;       // Indicates current tab is loading
  public isProcessing: boolean = false;   // Indicates that the current page is busy processing a change.
  public currentChanges: number[][] = []; // Tracks which setting items on the current page have changed

  public settingType: (typeof SettingType) = SettingType;

  // Convenience properties for assisting the template in laying out columns of setting groups for the current page/tab
  public columnCount: number = 3;
  public colIdxs: number[] = range(0, this.columnCount);
  public groupIdxs: number[] = [];

  // Internal (private) vars
  private pageIdx: number = -1;   // Tracks the current displayed page


  constructor(
    private _store: Store,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService
  ) { };

  ngOnInit() {
    this.settingPages.push({
      header: 'Global',
      icon: 'part-cog',
      info: {
        title: 'Application Settings',
        description: 'Adjust settings and configuration that apply across the entire application',
        help: 'Please take note of any setting changes that require a restart of the Particl Desktop application.'
      } as PageInfo,
      settingGroups: [],
      load: (<PageLoadFunction>this.pageLoadGlobalSettings)
    } as Page);

    this.changeTab(0);

  }

  ngOnDestroy() {
  }

  /**
   * Extracts the current rendered page
   */
  get currentPage(): Page | null {
    return this.pageIdx >= 0 ? this.settingPages[this.pageIdx] : null;
  }

  /**
   * Changes the currently loaded tab
   * @param idx The index of the page/tab (from this.settingPages) to be loaded
   */
  changeTab(idx: number): void {
    if (this.isProcessing) {
      return;
    }
    if ( (this.pageIdx === idx) || (idx < 0) || (idx >= this.settingPages.length) ) {
      return;
    }
    this.isLoading = true;
    this.isProcessing = false;
    this.disableUI(TextContent.LOADING);
    this.pageIdx = idx;
    this.loadPageSettings(idx);
  }

  /**
   * Called when a setting value has been changed. This executes the specific settings 'validate' function,
   *  if available, and the executes the setting's 'onChange' function if its been provided.
   *
   * Applies to the currently loaded page
   * @param groupIdx the index of the group on the current page that the setting belongs to
   * @param settingIdx the index of the setting in the group
   */
  settingChangedValue(groupIdx: number, settingIdx: number) {
    if (this.isLoading ||
      !(groupIdx >= 0 && groupIdx < this.currentPage.settingGroups.length) ||
      !(settingIdx >= 0 && settingIdx < this.currentPage.settingGroups[groupIdx].settings.length)) {
        return;
    }

    this.isProcessing = true;
    const setting = this.currentPage.settingGroups[groupIdx].settings[settingIdx];

    if (setting.type === SettingType.BUTTON) {
      // this.disableUI(TextContent.SAVING);
    }

    if (setting.validate) {
      const response = setting.validate(setting.newValue, setting);
      if (response) {
        setting.errorMsg = response;
      } else {
        setting.errorMsg = '';
      }
    }
    if (setting.onChange) {
      const response = setting.onChange(setting.newValue, setting);
      if (response) {
        setting.errorMsg = response;
      } else {
        setting.errorMsg = '';
      }
    }
    const listedError = this.currentPage.settingErrors.findIndex(
      errItem => (errItem.grpIdx === groupIdx) && (errItem.setIdx === settingIdx)
    );

    if (setting.errorMsg && (listedError === -1)) {
      this.currentPage.settingErrors.push({grpIdx: groupIdx, setIdx: settingIdx});
    } else if (!setting.errorMsg && (listedError > -1)) {
      this.currentPage.settingErrors.splice(listedError, 1);
    }

    const changeIdx = this.currentChanges.findIndex((change) => change[0] === groupIdx && change[1] === settingIdx);

    if ((setting.currentValue !== setting.newValue) && (changeIdx === -1)) {
      this.currentChanges.push([groupIdx, settingIdx]);
    } else if ((setting.currentValue === setting.newValue) && (changeIdx !== -1)) {
      this.currentChanges.splice(changeIdx, 1);
    }

    if (setting.type === SettingType.BUTTON) {
      // this.enableUI();
    }

    this.isProcessing = false;
  }

  /**
   * Resets changes to any settings on the currently loaded page.
   */
  clearChanges() {
    if (this.isLoading) {
      return;
    }
    this.isProcessing = true;
    this.resetPageChanges(this.pageIdx);
    this.currentChanges = [];
    this.isProcessing = false;
  }

  /**
   * Saves all modified changes on the current displayed page/tab.
   * Validates each modified setting if a validate function is specified.
   * If no setting validation errors occur, then the SettingPages's "save" function is invoked.
   */
  saveChanges() {
    if (this.isLoading) {
      return;
    }

    if (this.isProcessing) {
      this._snackbar.open(TextContent.ERROR_BUSY_PROCESSING);
      return;
    }

    this.isProcessing = true;
    this.disableUI(TextContent.SAVING);

    // Validation of each changed setting ensures page is not in an error state
    let hasError = false;
    let hasChanged = false;
    this.settingPages[this.pageIdx].settingGroups.forEach(group => {
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
      this._snackbar.open(errMsg);
      return;
    }

    this.saveCurrentPageSettings().pipe(
      take(1)
    ).subscribe(
      (doRestart: boolean) => {

        // Change current settings in case it has not been done
        this.settingPages[this.pageIdx].settingGroups.forEach(group => {
          group.settings.forEach(setting => {
            if ( !(setting.type === SettingType.BUTTON)) {
              setting.currentValue = setting.newValue;
            }
            setting.errorMsg = '';
          });
        });

        // reset the list of current changes
        this.currentChanges = [];
        this.isProcessing = false;
        this.enableUI();
        this._snackbar.open(TextContent.SAVE_SUCCESSFUL);

        if (doRestart) {
          this.actionRestartApplication();
        }
      },
      (err) => {
        this.isProcessing = false;
        this.enableUI();
        this._snackbar.open(TextContent.SAVE_FAILED);
      }
    );
  }

  /**
   * (PRIVATE)
   * Performs the resetting of values on an indicates page.
   * Resetting in this context means updating the setting's "newValue" value with its "currentValue" value.
   * @param pageIndex The index of the page which needs to be reset
   */
  private resetPageChanges(pageIndex: number) {
    // Reset each setting for the indicated page to the last saved value;
    this.settingPages[pageIndex].settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        if ( !(setting.type === SettingType.BUTTON)) {
          setting.newValue = setting.currentValue;
        }
        setting.errorMsg = '';
      })
    });
    this.settingPages[pageIndex].settingErrors = [];
  }

  /**
   * (PRIVATE)
   * Invokes a specific page's load function, if it has not been previously loaded.
   * @param pageIndex The index of the page that should be loaded
   */
  private async loadPageSettings(pageIndex: number) {
    const selectedPage = this.settingPages[pageIndex];
    const isActivePage = pageIndex === this.pageIdx;

    if (isActivePage) {
      this.groupIdxs = [];
    }

    if (selectedPage.settingGroups.length <= 0) {
      let fn: Function;
      if (selectedPage && (typeof selectedPage.load === 'function')) {
        fn = selectedPage.load.bind(this);
      }

      if (fn !== undefined) {
        await fn(selectedPage.settingGroups).catch(() => {});
      }

      selectedPage.settingGroups.forEach(group => {
        group.settings.forEach(setting => {
          if (setting.validate) {
            setting.validate = setting.validate.bind(this);
          }
          if (setting.onChange) {
            setting.onChange = setting.onChange.bind(this);
          }
        })
      });
    }

    this.resetPageChanges(pageIndex);

    if (isActivePage) {
      this.groupIdxs = range(0, selectedPage.settingGroups.length, this.columnCount);
      this.isLoading = false;
      this.enableUI();
    }
  }

  /**
   * (PRIVATE)
   * Displays a busy indicator overlay preventing the user from interacting with the page
   * @param message the text to be displayed in the loading overlay
   */
  private disableUI(message: string) {
    this._dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: message
      }
    });
  }

  /**
   * (PRIVATE)
   * Closes any open busy indicator overlay
   */
  private enableUI() {
    this._dialog.closeAll();
  }

  /**
   * Extracts the changed settings on the current page for persisting the changes
   */
  private saveCurrentPageSettings(): Observable<boolean> {
    return new Observable((observer) => {

      let restartRequired = false;
      const actions = [];

      this.settingPages[this.pageIdx].settingGroups.forEach(group => {
        group.settings.forEach((setting) => {
          if ( !(setting.type === SettingType.BUTTON) && (setting.currentValue !== setting.newValue)) {
            actions.push(new AppSettings.SetSetting(setting.id, setting.newValue));
            if (setting.restartRequired) {
              restartRequired = true;
            }
          }
        });
      });

      this._store.dispatch(actions).subscribe(
        () => {
          observer.next(restartRequired);
        },
        () => {

        },
        () => {
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


  /**
   * ***********************************************************************
   * ***********************************************************************
   *
   *    PAGE SPECIFIC FUNCTIONALITY (LOAD FUNCTION DEFINITIONS,
   *      SETTING SPECIFIC VALIDATION/CHANGE FUNCTIONS) OCCURS BELOW
   *
   * ***********************************************************************
   * ***********************************************************************
   */


  /**
   * The specific page load function for the "Global" tab
   */
  private async pageLoadGlobalSettings(group: SettingGroup[]) {

    const globalSettings = this._store.selectSnapshot(ApplicationState.appSettings);

    const userInterface = {
      name: 'User Interface',
      settings: []
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
          isDisabled: false
        } as SelectableOption
      ],
      restartRequired: false
    } as Setting);


    const coreNetConfig = {
      name: 'Core network connection',
      settings: []
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
      description: 'Directs core to connect via a socks5 proxy. Example value would be: 127.0.0.1:9050',
      isDisabled: false,
      type: SettingType.STRING,
      errorMsg: '',
      currentValue: globalSettings.proxy,
      tags: [],
      restartRequired: true,
      validate: this.validateIPAddressPort
    } as Setting);

    const marketplaceConfig = {
      name: 'App Startup Options',
      settings: []
    } as SettingGroup;

    marketplaceConfig.settings.push({
      id: 'global.marketActive',
      title: 'Launch Marketplace',
      description: 'Launch the Particl Marketplace service by default when the application starts. This starts the service in the background regardless of whether in wallet or market mode',
      isDisabled: false,
      type: SettingType.BOOLEAN,
      errorMsg: '',
      currentValue: globalSettings.marketActive,
      tags: [],
      restartRequired: false
    } as Setting);

    group.push(userInterface);
    group.push(marketplaceConfig);
    group.push(coreNetConfig);
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
