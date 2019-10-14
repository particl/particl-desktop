import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable, Observer } from 'rxjs';
import { take, takeWhile } from 'rxjs/operators';
import { range } from 'lodash';

import { RpcService } from 'app/core/rpc/rpc.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { SettingsStateService } from './settings-state.service';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';

import { IWallet } from 'app/multiwallet/multiwallet.service';

type PageLoadFunction = (group: SettingGroup[]) => Promise<void>;
type ValidationFunction = (value: any, setting: Setting) => string | void;

// Indicates the distinct type of the setting. Impacts the visual rendering of the setting, as well
//  as functionality (eg: BUTTON types are ignored when performing save functionality)
enum SettingType {
  STRING = 0,
  NUMBER = 1,
  BOOLEAN = 2,
  SELECT = 3,
  BUTTON = 4
};

// Details needed to render <option> elements
class SelectableOption {
  text: string;
  value: any;
  isDisabled: boolean;
}

// Render options for the SettingType.NUMBER type
class ParamsNumber {
  min: number;
  max: number;
  step: number;
}

// Render options for the SettingType.STRING type
class ParamsString {
  placeholder: string;
}

// Render options for the SettingType.BUTTON type
class ParamsButton {
  icon: string;
  color: string;
}

// Defines a Setting item
class Setting {
  id: string;                     // Easy identification of the setting (typically the SettingState service id, useful for when saving)
  title: string;                  // the primary text displayed to the user (or the button text for SettingType.BUTTON items)
  description: string;            // Additional help/description tex tfor this particular setting
  isDisabled: boolean;            // Where to render the setting as disabled
  type: SettingType;              // The specific type of the setting
  limits: null | ParamsNumber | ParamsString | ParamsButton;  // Additional (optional) type specific render options
  errorMsg?: string;              // Error message text indicating an error with this particular setting
  options?: SelectableOption[];   // Only applicable if type === SettingType.SELECT : the options for the select item
  currentValue: any;              // The current saved value for this setting. Ignored for SettingType.BUTTON
  newValue: any;                  // The new, unsaved value that the user wants. Otherwise contains the same value as the current value.
  tags: string[];                 // A list of tags to display for the setting. Typically draws attention to additional, useful info.
  restartRequired: boolean;       // Indicates whether a restart of a particular service or the applicaiton as a whole is required.
  validate?: ValidationFunction;  // Optional validation function that is executed when the user changes the value.
                                  //  The validation function gets a copy of the new value.
                                  //  Executed when the page save function is called to ensure the changed 'newvalue' is actually valid.
  onChange?: ValidationFunction;  // Optional function executed when the setting is changed.
                                  //  Similar to the validation function, but run after validation.
                                  //  NOT executed when the page save function is called.
};

// Provides a means to group together similar settings.
class SettingGroup {
  id?: string;                    // Easy identification of the setting group (eg: when saving)
  name: string;
  settings: Setting[];            // The settings in this group
};

// Additional information applicable to the content of the page (rendered as a tab on the Settings page)
class PageInfo {
  title: string;
  description: string;
  help: string;
};

// Defines a page (rendered as a tab on the Settings page) of groups of settings
class Page {
  header: string;                 // tab name
  icon: string;                   // tab icon
  info: PageInfo;                 // general information about the page (tab), displayed in the tab
  settingGroups: SettingGroup[];  // a group of similar settings... all displayed close to each other
  load: PageLoadFunction;         // executed when the page (tab) is loaded
  hasErrors: boolean;
};

// Convenience means for defining text content for loading/waiting/error messages
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
  public isLoading: boolean = true;       // Indicates current tab is loading
  public isProcessing: boolean = false;   // Indicates that the current page is busy processing a change.
  public currentChanges: number[][] = []; // Tracks which setting items on the current page have changed
  public currentWallet: IWallet = null;   // Convient reference to the current wallet (for wallet specific settings)

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
    // Ensures that the settings service is initialized and available (currently mostly as a guard for live reload cases).
    new Observable((observer) => {
      this.initializeComponent(observer);
    }).subscribe(
      async () => {

        this.currentWallet = await this._settingState.currentWallet().pipe(take(1)).toPromise();

        // Create the pages (tabs) to be available

        this.settingPages.push({
          header: 'Wallet Settings',
          icon: 'part-hamburger',
          info: {
            title: '',
            description: 'Adjust settings and configuration for the currently active wallet',
            help: 'To change settings for other wallets, switch to them first in the multiwallet sidebar and visit this page again.'
          } as PageInfo,
          settingGroups: [],
          load: (<PageLoadFunction>this.pageLoadWalletSettings)
        } as Page);

        this.settingPages.push({
          header: 'Global Settings',
          icon: 'part-hamburger',
          info: {
            title: 'Global Application Settings',
            description: 'Adjust settings and configuration that apply to the application (rather than an individual wallet)',
            help: 'Please take note of setting changes that require a service restart.'
          } as PageInfo,
          settingGroups: [],
          load: (<PageLoadFunction>this.pageLoadGlobalSettings)
        } as Page);

        this.changeTab(0);

      },
      (_err) => {},
      () => {
        // Set up wallet change listener -> in case the wallet changes while this component is loaded.
        this._settingState.currentWallet().pipe(
          takeWhile(() => !this.isDestroyed)
        ).subscribe(
          (wallet: IWallet) => {
            // Only necessary to force a change if changed to a different wallet
            if ( (wallet === null && this.currentWallet !== null) ||
            (this.currentWallet === null && wallet !== null) ||
            (this.currentWallet !== null && wallet !== null && this.currentWallet.name !== wallet.name)) {

              this.currentWallet = wallet;

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
      }
    );
  }

  ngOnDestroy() {
    this.isDestroyed = true;
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
      this.disableUI(TextContent.SAVING);
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

  /**
   * Resets changes to any settings on the currently loaded page.
   */
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
    this.settingPages[pageIndex].hasErrors = false;
  }

  /**
   * (PRIVATE)
   * Helper method to determine whether the settings service that this component depends on has been loaded.
   * This is used here to ensure that the component loads with the correct details when invoking Angular's live reload (during dev work)
   */
  private initializeComponent(observer: Observer<any>) {
    if (this.isDestroyed) {
      return;
    }

    if (!this._settingState.initialized) {
      setTimeout(this.initializeComponent.bind(this), 500, observer);
      return;
    }

    observer.next(null);
    observer.complete();
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
  private saveCurrentPageSettings(): Observable<string | void> {
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
   * The specific page load function for the "Wallet Settings" tab
   */
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

  /**
   * The specific page load function for the "Global" tab
   */
  private async pageLoadGlobalSettings(group: SettingGroup[]) {

    const langGroup = {
      name: 'Current Language',
      settings: []
    } as SettingGroup;

    langGroup.settings.push({
      id: 'settings.global.language',
      title: 'Change Language',
      description: 'Change the application language',
      isDisabled: true,
      type: SettingType.SELECT,
      errorMsg: '',
      currentValue: this._settingState.get('settings.global.language'),
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
      id: 'settings.core.network.proxy',
      title: 'Proxy',
      description: 'Directs core to connect via a socks5 proxy. Example value would be: 127.0.0.1:9050',
      isDisabled: false,
      type: SettingType.STRING,
      errorMsg: '',
      currentValue: this._settingState.get('settings.core.network.proxy'),
      tags: [],
      restartRequired: true,
      validate: this.validateIPAddressPort
    } as Setting);

    group.push(langGroup);
    group.push(coreNetConfig);
  }

  private validateIPAddressPort(value: any, setting: Setting): string | null {
    const strVal = String(value);
    const parts = strVal.split(':');
    const octs = String(parts[0]).split('.');
    let isValid = ( (octs.length === 4) && (octs.find(oct => (+oct > 255) || (+oct < 1) ) === undefined) );

    if (parts[1]) {
      const port = +(String(parts[1]));
      isValid = isValid && (port > 0) && (port <= 65535);
    }

    if (!isValid) {
      return 'Invalid IPv4 address and/or port';
    }

    return null;
  }
}
