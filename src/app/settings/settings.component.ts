import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { range } from 'lodash';

import { RpcService } from 'app/core/rpc/rpc.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';

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
export class SettingsComponent implements OnInit {
  public settingPages: Array<Page> = [];
  public isLoading: boolean = true;       // Change of page indicator
  public isProcessing: boolean = false;   // 'Busy' indicator on the current displayed page
  public currentChanges: number[][] = [];

  public settingType: (typeof SettingType) = SettingType;

  // Convenience properties for assisting the template in laying out columns of setting groups
  public columnCount: number = 2;
  public colIdxs: number[] = range(0, this.columnCount);
  public groupIdxs: number[] = [];

  // Internal (private) vars
  private pageIdx: number = -1;   // Tracks the current displayed page

  constructor(
    private _rpc: RpcService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) { };

  ngOnInit() {
    // Create the pages (tabs) used here
    const walletName = this._rpc.wallet === '' ? 'Default' : this._rpc.wallet;
    const walletSettings = {
      header: 'Wallet Settings',
      icon: 'part-hamburger',
      info: {
        title: 'Settings for wallet ' + walletName,
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

    setTimeout(() => {
      this.disableUI(TextContent.LOADING);
      this.changeTab(0);
    }, 0);
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

  private async loadPageSettings(pageIndex: number, isActivePage: boolean = true) {
    const selectedPage = this.settingPages[pageIndex];

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
      observer.next();
      observer.complete();
    });
  }

  private async pageLoadWalletSettings(group: SettingGroup[]) {
    // const group1 = {
    //   name: 'Test Group',
    //   settings: []
    // } as SettingGroup;

    // const group2 = {
    //   name: 'Test Group 2',
    //   settings: []
    // } as SettingGroup;

    // const group3 = {
    //   name: 'Test Group 3',
    //   settings: []
    // } as SettingGroup;

    // const group4 = {
    //   name: 'Test Group 4',
    //   settings: []
    // } as SettingGroup;

    // const group5 = {
    //   name: 'Test Group 5',
    //   settings: []
    // } as SettingGroup;

    // const testNum = {
    //   title: 'testing Number input',
    //   description: 'number description goes here',
    //   isDisabled: false,
    //   type: SettingType.NUMBER,
    //   errorMsg: '',
    //   currentValue: 12,
    //   tags: ['tag1', 'tag2'],
    //   restartRequired: false
    // } as Setting;

    // const testNum2 = {
    //   title: 'testing other input',
    //   description: 'number description goes here',
    //   isDisabled: false,
    //   type: SettingType.NUMBER,
    //   errorMsg: '',
    //   currentValue: 12,
    //   tags: ['tag1', 'tag2'],
    //   restartRequired: true,
    //   limits: { min: 5, max: 50, step: 5} as ParamsNumber
    // } as Setting;

    // const testSelect = {
    //   title: 'testing Selectable input',
    //   description: 'select with some options description goes here',
    //   isDisabled: false,
    //   type: SettingType.SELECT,
    //   options: [
    //     {text: 'option 1', value: 1, isDisabled: false},
    //     {text: 'option 2', value: 2, isDisabled: true},
    //     {text: 'option 3', value: 3, isDisabled: false},
    //   ],
    //   errorMsg: '',
    //   currentValue: 1,
    //   tags: ['tag1'],
    //   restartRequired: true
    // } as Setting;

    // const testString = {
    //   title: 'testing input type input',
    //   description: 'regular text description goes here',
    //   isDisabled: false,
    //   type: SettingType.STRING,
    //   errorMsg: 'example error message',
    //   currentValue: 'some value',
    //   tags: [],
    //   restartRequired: true
    // } as Setting;

    // const testString2 = {
    //   title: 'testing 2nd input type input',
    //   description: 'regular text description goes here',
    //   isDisabled: false,
    //   type: SettingType.STRING,
    //   errorMsg: '',
    //   currentValue: 'another value',
    //   tags: ['tag', 'tag2'],
    //   restartRequired: false,
    //   validate: (val, setting) => {
    //     if (val.length > 5) {
    //       return 'Invalid field length'
    //     }
    //   }
    // } as Setting;

    // const testButton = {
    //   title: 'test a button here',
    //   description: 'does the button text even count',
    //   isDisabled: false,
    //   type: SettingType.BUTTON,
    //   errorMsg: '',
    //   tags: [],
    //   restartRequired: true
    // } as Setting;

    // const testButton2 = {
    //   title: 'test a button here',
    //   description: '',
    //   isDisabled: false,
    //   type: SettingType.BUTTON,
    //   errorMsg: 'example error message',
    //   tags: [],
    //   restartRequired: true,
    //   limits: { icon: 'part-check', color: 'primary' },
    //   onChange: (val, setting) => {
    //     console.log('Button clicked');
    //     return this.buttonClicked();
    //   }
    // } as Setting;

    // const testString3 = {
    //   title: 'testing input type input',
    //   description: 'regular text description goes here',
    //   isDisabled: false,
    //   type: SettingType.STRING,
    //   errorMsg: '',
    //   currentValue: 'some value',
    //   tags: [],
    //   restartRequired: true,
    //   limits: { placeholder: 'test string 3 input' }
    // } as Setting;

    // const testBool1 = {
    //   title: 'testing checkboxes',
    //   description: 'a checkbox test',
    //   isDisabled: false,
    //   type: SettingType.BOOLEAN,
    //   errorMsg: 'example error message',
    //   currentValue: true,
    //   tags: ['yay'],
    //   restartRequired: true,
    //   onChange: this.checkboxupdated
    // } as Setting;

    // group1.settings.push(testNum);
    // group1.settings.push(testSelect);
    // group1.settings.push(testString);
    // group1.settings.push(testBool1);

    // group2.settings.push(testString2);
    // group2.settings.push(testButton);

    // group3.settings.push(testString3);

    // group4.settings.push(testButton2);

    // group5.settings.push(testNum2);

    // group.push(group1);
    // group.push(group2);
    // group.push(group3);
    // group.push(group4);
    // group.push(group5);

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
