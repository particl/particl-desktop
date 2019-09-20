import { Component, OnInit } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MatDialog } from '@angular/material';

import { range } from 'lodash';

import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';

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
  validate?: Function;
  onChange?: Function;
  fn?: Function;            // Currently only applicable for SettingType.BUTTON
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
  isChanged: boolean;             // indicates that a setting has been changed (UI control use)
  load: Function;                 // executed when the page (tab) is loaded
};

enum ProcessingMessages {
  LOADING = 'Loading applicable settings',
  SAVING = 'Attempting to save configuration changes',
  RESET = 'Processing your request to cleear unsaved changes'
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public settingPages: Array<Page> = [];
  public isLoading: boolean = true;

  public settingType: (typeof SettingType) = SettingType;

  // Convenience properties for assisting the laying out columns of setting groups
  public columnCount: number = 2;
  public colIdxs: number[] = range(0, this.columnCount);
  public groupIdxs: number[] = [];

  // Internal (private) vars
  private isProcessing: boolean = false;
  private pageIdx: number = -1;

  constructor(
    private _rpc: RpcService,
    private _dialog: MatDialog
  ) {
  };

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
      isChanged: false,
      load: this.loadWalletSettings,
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
      isChanged: false,
      load: this.loadGlobalSettings,
    } as Page;

    this.settingPages.push(walletSettings);
    this.settingPages.push(globalSettings);

    setTimeout(() => {
      this.disableUI(ProcessingMessages.LOADING);
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
    this.disableUI(ProcessingMessages.LOADING);
    this.pageIdx = idx;
    // this.resetPageChanges(idx);  // Perform this step only if NOT requesting settings on page load
    this.loadPageSettings(idx);
  }

  clearChanges() {
    if (this.isLoading) {
      return;
    }
    this.isProcessing = true;
    this.disableUI(ProcessingMessages.RESET);
    this.resetPageChanges(this.pageIdx);
    this.isProcessing = false;
    this.enableUI();
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
    this.settingPages[pageIndex].isChanged = false;
  }

  private async loadPageSettings(pageIndex: number) {
    const selectedPage = this.settingPages[pageIndex];

    if (selectedPage.settingGroups.length) {
      this.resetPageChanges(pageIndex);
      this.groupIdxs = range(0, selectedPage.settingGroups.length, this.columnCount);
      this.isLoading = false;
      this.enableUI();
      return;
    }

    this.groupIdxs = [];

    let fn: Function;
    if (selectedPage && (typeof selectedPage.load === 'function')) {
      fn = selectedPage.load.bind(this);
    }

    if (fn !== undefined) {
      await fn(selectedPage).catch(() => {}).then(() => {
        this.resetPageChanges(pageIndex);
        this.groupIdxs = range(0, selectedPage.settingGroups.length, this.columnCount);
        this.isLoading = false;
        this.enableUI();
      });
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

  private async loadWalletSettings() {
    const settingGroups: SettingGroup[] = [];
    const group1 = {
      name: 'Test Group',
      settings: []
    } as SettingGroup;

    const group2 = {
      name: 'Test Group 2',
      settings: []
    } as SettingGroup;

    const group3 = {
      name: 'Test Group 3',
      settings: []
    } as SettingGroup;

    const group4 = {
      name: 'Test Group 4',
      settings: []
    } as SettingGroup;

    const group5 = {
      name: 'Test Group 5',
      settings: []
    } as SettingGroup;

    const testNum = {
      title: 'testing Number input',
      description: 'number description goes here',
      isDisabled: true,
      type: SettingType.NUMBER,
      errorMsg: '',
      currentValue: 12,
      tags: ['tag1', 'tag2'],
      restartRequired: false
    } as Setting;

    const testNum2 = {
      title: 'testing other input',
      description: 'number description goes here',
      isDisabled: false,
      type: SettingType.NUMBER,
      errorMsg: '',
      currentValue: 12,
      tags: ['tag1', 'tag2'],
      restartRequired: true,
      limits: { min: 5, max: 50, step: 5} as ParamsNumber
    } as Setting;

    const testSelect = {
      title: 'testing Selectable input',
      description: 'select with some options description goes here',
      isDisabled: false,
      type: SettingType.SELECT,
      options: [
        {text: 'option 1', value: 1, isDisabled: false},
        {text: 'option 2', value: 2, isDisabled: true},
        {text: 'option 3', value: 3, isDisabled: false},
      ],
      errorMsg: '',
      currentValue: 1,
      tags: ['tag1'],
      restartRequired: true
    } as Setting;

    const testString = {
      title: 'testing input type input',
      description: 'regular text description goes here',
      isDisabled: false,
      type: SettingType.STRING,
      errorMsg: 'example error message',
      currentValue: 'some value',
      tags: [],
      restartRequired: true
    } as Setting;

    const testString2 = {
      title: 'testing 2nd input type input',
      description: 'regular text description goes here',
      isDisabled: true,
      type: SettingType.STRING,
      errorMsg: '',
      currentValue: 'another value',
      tags: ['tag', 'tag2'],
      restartRequired: false
    } as Setting;

    const testButton = {
      title: 'test a button here',
      description: 'does the button text even count',
      isDisabled: true,
      type: SettingType.BUTTON,
      errorMsg: '',
      tags: [],
      restartRequired: true
    } as Setting;

    const testButton2 = {
      title: 'test a button here',
      description: '',
      isDisabled: false,
      type: SettingType.BUTTON,
      errorMsg: 'example error message',
      tags: [],
      restartRequired: true,
      limits: { icon: 'part-check', color: 'primary' }
    } as Setting;

    const testString3 = {
      title: 'testing input type input',
      description: 'regular text description goes here',
      isDisabled: false,
      type: SettingType.STRING,
      errorMsg: '',
      currentValue: 'some value',
      tags: [],
      restartRequired: true,
      limits: { placeholder: 'test string 3 input' }
    } as Setting;

    const testBool1 = {
      title: 'testing checkboxes',
      description: 'a checkbox test',
      isDisabled: true,
      type: SettingType.BOOLEAN,
      errorMsg: 'example error message',
      currentValue: true,
      tags: ['yay'],
      restartRequired: true,
    } as Setting;

    group1.settings.push(testNum);
    group1.settings.push(testSelect);
    group1.settings.push(testString);
    group1.settings.push(testBool1);

    group2.settings.push(testString2);
    group2.settings.push(testButton);

    group3.settings.push(testString3);

    group4.settings.push(testButton2);

    group5.settings.push(testNum2);

    settingGroups.push(group1);
    settingGroups.push(group2);
    settingGroups.push(group3);
    settingGroups.push(group4);
    settingGroups.push(group5);

    this.settingPages[this.pageIdx].settingGroups = settingGroups;
  }

  private async loadGlobalSettings() {
    console.log('@@@@ loading global settings');
  }
}
