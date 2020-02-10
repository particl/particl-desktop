import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store, Select } from '@ngxs/store';
import { range } from 'lodash';
import { take, concatMap } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { ApplicationRestartModalComponent } from 'app/main/components/application-restart-modal/application-restart-modal.component';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { WalletBackupModalComponent } from './wallet-backup-modal/wallet-backup-modal.component';

import {
  Page,
  PageInfo,
  TextContent,
  SettingType,
  PageLoadFunction,
  SettingGroup,
  Setting
} from 'app/main-extra/global-settings/settings.types';
import { WalletInfoState, WalletSettingsState } from 'app/main/store/main.state';
import { WalletSettingsStateModel } from 'app/main/store/main.models';
import { WalletDetailActions } from 'app/main/store/main.actions';


@Component({
  selector: 'main-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class WalletSettingsComponent implements OnInit, OnDestroy {

  @Select(WalletInfoState.getValue('walletname')) walletName: Observable<string>;

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
    private _snackbar: SnackbarService,
    private _rpc: MainRpcService
  ) { };

  ngOnInit() {
    this.settingPages.push({
      icon: 'part-cog',
      info: {
        title: 'Wallet Specific Settings',
        description: 'Adjust settings and configuration that apply to the current selected wallet',
        help: ''
      } as PageInfo,
      settingGroups: [],
      load: (<PageLoadFunction>this.pageLoadWalletSettings)
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
      this._snackbar.open(TextContent.ERROR_BUSY_PROCESSING, 'err');
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
      this._snackbar.open(errMsg, 'info');
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
        this._snackbar.open(TextContent.SAVE_FAILED, 'err');
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

      const wName = <string>this._store.selectSnapshot(WalletInfoState.getValue('walletname'));

      this.settingPages[this.pageIdx].settingGroups.forEach(group => {
        group.settings.forEach((setting) => {
          if ( !(setting.type === SettingType.BUTTON) && (setting.currentValue !== setting.newValue)) {
            actions.push(new WalletDetailActions.SetSetting(wName, setting.id, setting.newValue));
            if (setting.restartRequired) {
              restartRequired = true;
            }
          }
        });
      });

      from(actions).pipe(
        concatMap((action) => this._store.dispatch(action))
      ).subscribe(
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
   * The specific page load function for the wallet settings
   */
  private async pageLoadWalletSettings(group: SettingGroup[]) {

    const walletSettings: WalletSettingsStateModel = this._store.selectSnapshot(WalletSettingsState);

    const notificationsWallet = {
      name: 'Wallet Notifications',
      settings: []
    } as SettingGroup;

    notificationsWallet.settings.push({
      id: 'notifications_payment_received',
      title: 'Payment Received',
      description: 'Display a system notification message when a wallet payment has been received',
      isDisabled: false,
      type: SettingType.BOOLEAN,
      errorMsg: '',
      currentValue: walletSettings.notifications_payment_received,
      tags: [],
      restartRequired: false
    } as Setting);

    notificationsWallet.settings.push({
      id: 'notifications_staking_reward',
      title: 'Staking Rewards',
      description: 'Display a system notification message when a stake has been found on this wallet',
      isDisabled: false,
      type: SettingType.BOOLEAN,
      errorMsg: '',
      currentValue: walletSettings.notifications_staking_reward,
      tags: [],
      restartRequired: false
    } as Setting);

    group.push(notificationsWallet);


    const dangerZone = {
      name: 'Danger Zone',
      settings: []
    } as SettingGroup;

    dangerZone.settings.push({
      id: '',
      title: 'Backup Wallet',
      description: 'Create a wallet file backup (the wallet.dat file for the current wallet) in a different folder location',
      isDisabled: false,
      type: SettingType.BUTTON,
      errorMsg: '',
      tags: [],
      restartRequired: false,
      currentValue: '',
      newValue: '',
      limits: {color: 'primary', icon: 'part-archive'},
      onChange: this.actionBackupWallet
    } as Setting);

    group.push(dangerZone);
  }


  private actionBackupWallet() {
    const dialogRef = this._dialog.open(WalletBackupModalComponent);
    dialogRef.componentInstance.onConfirmation.subscribe(async (folderPath: string) => {
      this.disableUI(TextContent.SAVING);
      const success = await this._rpc.call('backupwallet', [folderPath]).toPromise().then(() => true).catch(() => false);
      this.enableUI();
      const message = success ? TextContent.SAVE_SUCCESSFUL : TextContent.SAVE_FAILED;
      this._snackbar.open(message);
    });
  }

}
