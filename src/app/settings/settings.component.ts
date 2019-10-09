import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { take, takeWhile } from 'rxjs/operators';
import { range } from 'lodash';

import { RpcService } from 'app/core/rpc/rpc.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { SettingsStateService } from './settings-state.service';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';

import { IWallet } from 'app/multiwallet/multiwallet.service';

type PageLoadFunction = (group: SettingGroup[]) => Promise<void>;
type PageSaveFunction = () => Observable<string | void>;
type ValidationFunction = (value: any, setting: Setting) => string | void;

enum SettingType {
  STRING = 0,
  NUMBER = 1,
  BOOLEAN = 2,
  SELECT = 3,
  BUTTON = 4
};

class SelectableOption {
  text: string;
  value: any;
  isDisabled: boolean;
}

class ParamsNumber {
  min: number;
  max: number;
  step: number;
}

class ParamsString {
  placeholder: string;
}

class ParamsButton {
  icon: string;
  color: string;
}

class Setting {
  id: string;                    // Easy identification of the setting (eg: when saving)
  title: string;
  description: string;
  isDisabled: boolean;
  type: SettingType;
  limits: null | ParamsNumber | ParamsString | ParamsButton;
  errorMsg?: string;
  options?: SelectableOption[];   // Only applicable if type === SettingType.SELECT
  currentValue: any;              // Ignored for SettingType.BUTTON
  newValue: any;                  // Ignored for SettingType.BUTTON
  tags: string[];
  restartRequired: boolean;
  validate?: ValidationFunction;
  onChange?: ValidationFunction;
};

class SettingGroup {
  id?: string;                    // Easy identification of the setting group (eg: when saving)
  name: string;
  settings: Setting[];
};

class PageInfo {
  title: string;
  description: string;
  help: string;
};

class Page {
  header: string;                 // tab name
  icon: string;                   // tab icon
  info: PageInfo;                 // general information about the page (tab)
  settingGroups: SettingGroup[];  // a group of similar settings... all displayed close to each other
  load: PageLoadFunction;         // executed when the page (tab) is loaded
  save: PageSaveFunction;
  hasErrors: boolean;
};

enum TextContent {
  LOADING = 'Loading applicable settings',
  SAVING = 'Performing requested updates',
  RESET = 'Resetting unsaved changes',
  ERROR_BUSY_PROCESSING = 'Changes not saved!',
  ERROR_INVALID_ITEMS = 'Please correct errors before attempting to save',
  SAVE_SUCCESSFUL = 'Successfully saved changes',
  SAVE_FAILED = 'Failed to properly save all changes',
  SAVE_NOT_NEEDED = 'Aborting save as no changes have been made'
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  public settingPages: Array<Page> = [];
  public isLoading: boolean = true;       // Change of page indicator
  public isProcessing: boolean = false;   // 'Busy' indicator on the current displayed page
  public currentChanges: number[][] = []; // Tracks which setting items ont he current page have changed
  public currentWallet: IWallet = null;

  public settingType: (typeof SettingType) = SettingType;

  // Convenience properties for assisting the template in laying out columns of setting groups
  public columnCount: number = 2;
  public colIdxs: number[] = range(0, this.columnCount);
  public groupIdxs: number[] = [];

  // Internal (private) vars
  private pageIdx: number = -1;   // Tracks the current displayed page
  private isDestroyed: boolean = false;

  constructor(
    private _rpc: RpcService,
    private _snackbar: SnackbarService,
    private _settingState: SettingsStateService,
    private _dialog: MatDialog
  ) { };

  ngOnInit() {
    // Create the pages (tabs) used here

    const walletSettings = {
      header: 'Wallet Settings',
      icon: 'part-hamburger',
      info: {
        title: '',
        description: 'Adjust settings and configuration for the currently active wallet',
        help: 'To change settings for other wallets, switch to them first in the multiwallet sidebar and visit this page again.'
      } as PageInfo,
      settingGroups: [],
      load: (<PageLoadFunction>this.pageLoadWalletSettings),
      save: this.pageSaveWalletSettings
    } as Page;
    const globalSettings = {
      header: 'Global Settings',
      icon: 'part-hamburger',
      info: {
        title: 'Global Application Settings',
        description: 'Adjust settings and configuration that apply to the application (rather than an individual wallet)',
        help: 'Please take note of setting changes that require a service restart.'
      } as PageInfo,
      settingGroups: [],
      load: (<PageLoadFunction>this.pageLoadGlobalSettings),
      save: this.pageSaveGlobalSettings
    } as Page;

    this.settingPages.push(walletSettings);
    this.settingPages.push(globalSettings);

    this._settingState.currentWallet().pipe(
      takeWhile(() => !this.isDestroyed)
    ).subscribe(
      (wallet: IWallet) => {

        if ( (wallet === null && this.currentWallet !== null) ||
        (this.currentWallet === null && wallet !== null) ||
        (this.currentWallet !== null && wallet !== null && this.currentWallet.name !== wallet.name)) {

          const walletPageIdx = this.settingPages.findIndex((page) => page.header === 'Wallet Settings');
          if (walletPageIdx > -1) {
            const walletPage = this.settingPages[walletPageIdx];
            walletPage.info.title = 'Settings for wallet ' + (wallet === null ? '<unknown>' : wallet.displayname);
            walletPage.settingGroups = [];

            if (walletPageIdx === this.pageIdx) {
              this.isLoading = true;
              this.disableUI(TextContent.LOADING);
              this.loadPageSettings(walletPageIdx);
            }
          }
        }
      }
    );

    setTimeout(() => {
      this.disableUI(TextContent.LOADING);
      this.changeTab(0);
    }, 0);
  }

  ngOnDestroy() {
    this.isDestroyed = true;
  }

  get currentPage(): Page | null {
    return this.pageIdx >= 0 ? this.settingPages[this.pageIdx] : null;
  }

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

  settingChangedValue(groupIdx: number, settingIdx: number) {
    if (this.isLoading ||
      !(groupIdx >= 0 && groupIdx < this.currentPage.settingGroups.length) ||
      !(settingIdx >= 0 && settingIdx < this.currentPage.settingGroups[groupIdx].settings.length)) {
        return;
    }

    this.isProcessing = true;
    const setting = this.currentPage.settingGroups[groupIdx].settings[settingIdx];

    if (setting.type === SettingType.BUTTON) {
      this.disableUI(TextContent.SAVING);
    }

    if (setting.validate) {
      const response = setting.validate(setting.newValue, setting);
      if (response) {
        setting.errorMsg = response;
      }
    }
    if (setting.onChange) {
      const response = setting.onChange(setting.newValue, setting);
      if (response) {
        setting.errorMsg = response;
      }
    }
    if (setting.errorMsg) {
      this.currentPage.hasErrors = true;
    }

    const changeIdx = this.currentChanges.findIndex((change) => change[0] === groupIdx && change[1] === settingIdx);

    if ((setting.currentValue !== setting.newValue) && (changeIdx === -1)) {
      this.currentChanges.push([groupIdx, settingIdx]);
    } else if ((setting.currentValue === setting.newValue) && (changeIdx !== -1)) {
      this.currentChanges.splice(changeIdx, 1);
    }

    if (setting.type === SettingType.BUTTON) {
      this.enableUI();
    }

    this.isProcessing = false;
  }

  clearChanges() {
    if (this.isLoading) {
      return;
    }
    this.isProcessing = true;
    // this.disableUI(TextContent.RESET);
    this.resetPageChanges(this.pageIdx);
    this.currentChanges = [];
    this.isProcessing = false;
    // this.enableUI();
  }

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
    this.settingPages[pageIndex].hasErrors = false;
  }

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

    // Request the page save function
    let fn: Function;
    if (this.settingPages[this.pageIdx].save && (typeof this.settingPages[this.pageIdx].save === 'function')) {
      fn = this.settingPages[this.pageIdx].save.bind(this);
    }

    if (fn !== undefined) {

      fn().pipe(take(1)).subscribe(
        (resp: string | void) => {
          if (resp) {
            this.settingPages[this.pageIdx].hasErrors = true;
            this._snackbar.open(resp);
            return;
          }

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

          this._snackbar.open(TextContent.SAVE_SUCCESSFUL);
        },
        (err) => {
          this.settingPages[this.pageIdx].hasErrors = true;
          this._snackbar.open(TextContent.SAVE_FAILED);
        },
        () => {
          this.isProcessing = false;
          this.enableUI();
        }
      );
    } else {
      this.isProcessing = false;
      this.enableUI();
    }
  }

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

  private pageSaveWalletSettings(): Observable<string | void> {
    return new Observable((observer) => {

      const settingChanges: any[] = [];

      this.settingPages[this.pageIdx].settingGroups.forEach(group => {
        group.settings.forEach((setting) => {
          if ( !(setting.type === SettingType.BUTTON) && (setting.currentValue !== setting.newValue)) {
            settingChanges.push({label: setting.id, value: setting.newValue});
          }
        });
      });

      const errors = this._settingState.saveAll(settingChanges);
      if (errors.length) {
        this.settingPages[this.pageIdx].settingGroups.forEach(group => {
          group.settings.forEach((setting) => {
            if (errors.includes(setting.id)) {
              setting.errorMsg = 'An error occurred validating this setting';
            }
          });
        });

        observer.error(null);
      } else {
        observer.next();
      }
      observer.complete();
    });
  }

  private async pageLoadWalletSettings(group: SettingGroup[]) {

    const notificationsWallet = {
      name: 'Wallet Notifications',
      settings: []
    } as SettingGroup;

    notificationsWallet.settings.push({
      id: 'settings.wallet.notifications.payment_received',
      title: 'Payment Received',
      description: 'Display a system notification message when a wallet payment has been received',
      isDisabled: false,
      type: SettingType.BOOLEAN,
      errorMsg: '',
      currentValue: this._settingState.get('settings.wallet.notifications.payment_received'),
      tags: [],
      restartRequired: false
    } as Setting);

    notificationsWallet.settings.push({
      id: 'settings.wallet.notifications.staking_reward',
      title: 'Staking Rewards',
      description: 'Indicates when a stake has been found on this wallet',
      isDisabled: false,
      type: SettingType.BOOLEAN,
      errorMsg: '',
      currentValue: this._settingState.get('settings.wallet.notifications.staking_reward'),
      tags: ['Staking'],
      restartRequired: false
    } as Setting);

    group.push(notificationsWallet);

    if (this.currentWallet && this.currentWallet.isMarketEnabled) {
      const notificationsMarket = {
        id: 'market-notifications',
        name: 'Marketplace Notifications',
        settings: []
      } as SettingGroup;

      notificationsMarket.settings.push({
        id: 'settings.wallet.notifications.order_updated',
        title: 'Pending orders',
        description: 'Display a system notification message when an order requires action',
        isDisabled: !(this.currentWallet || {} as IWallet).isMarketEnabled,
        type: SettingType.BOOLEAN,
        errorMsg: '',
        currentValue: this._settingState.get('settings.wallet.notifications.order_updated'),
        tags: [],
        restartRequired: false
      } as Setting);

      notificationsMarket.settings.push({
        id: 'settings.wallet.notifications.proposal_arrived',
        title: 'New Proposals',
        description: 'Indicate via a system notification message when a new proposal is received',
        isDisabled: !(this.currentWallet || {} as IWallet).isMarketEnabled,
        type: SettingType.BOOLEAN,
        errorMsg: '',
        currentValue: this._settingState.get('settings.wallet.notifications.proposal_arrived'),
        tags: [],
        restartRequired: false
      } as Setting);

      group.push(notificationsMarket);

    }

  }

  private async pageLoadGlobalSettings() {
  }

  private pageSaveGlobalSettings(): Observable<string | void> {
    return new Observable((observer) => {
      observer.next();
      observer.complete();
    });
  }

  // private buttonClicked() {
  //   console.log('inside buttonClicked() handler');
  // }

  // private checkboxupdated(value: number, setting: Setting) {
  //   console.log('inside checkboxupdated() handler', JSON.stringify(value), setting);
  // }
}
