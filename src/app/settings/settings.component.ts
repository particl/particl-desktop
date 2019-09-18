import { Component, OnInit } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MatDialog } from '@angular/material';

import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';

enum SettingType {
  STRING = 0,
  NUMBER = 1,
  BOOLEAN = 2,
  SELECT = 3
};

class SelectableOption {
  text: string;
  value: any;
  isCurrent: boolean;
  isDisabled: boolean;
}

class Setting {
  title: string;
  description: string;
  isDisabled: boolean;
  isButton: boolean;
  type: SettingType;
  errorMsg?: string;
  options?: SelectableOption[];  // Only applicable if type === SettingType.SELECT
  currentValue: any;
  newValue: any;
  tags: string[];
  restartRequired: boolean;
  validate?: Function;
  onChange?: Function;
  onAction?: Function;
};

class SettingGroup {
  name: string;
  description: string;
  settings: Setting[];
};

class PageInfo {
  title: string;
  description: string;
  help: string;
};

class Page {
  header: string;
  info: PageInfo;
  icon: string;
  title: string;
  settingGroups: SettingGroup[];
  isChanged: boolean;
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

  public pageIdx: number = -1;
  public settingPages: Array<Page> = [];
  public isLoading: boolean = true;
  private isProcessing: boolean = false;

  constructor(
    private _rpc: RpcService,
    private _dialog: MatDialog
  ) {
  };

  ngOnInit() {
    const walletName = this._rpc.wallet === '' ? 'Default' : this._rpc.wallet;
    const walletSettings = {
      header: 'Wallet Settings',
      icon: 'part-hamburger',
      info: {
        title: 'Settings for wallet ' + walletName,
        description: 'Adjust settings and configuration for the currently active wallet',
        help: 'To change settings for other wallets, switch to them first in the multiwallet sidebar and visit this page again.'
      } as PageInfo,
      settingGroups: []
    } as Page;
    const globalSettings = {
      header: 'Global Settings',
      icon: 'part-hamburger',
      info: {
        title: 'Global Application Settings',
        description: 'Adjust settings and configuration that apply to the application (rather than an individual wallet)',
        help: 'Please take note of setting changes that require a service restart.'
      } as PageInfo,
      settingGroups: []
    } as Page;

    this.settingPages.push(walletSettings);
    this.settingPages.push(globalSettings);

    setTimeout(() => {
      this.disableUI(ProcessingMessages.LOADING);
      this.pageIdx = 0;
      this.loadTabData();
      this.isLoading = false;
      this.enableUI();
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
    this.clearCurrentChanges();
    this.pageIdx = idx;
    this.loadTabData();
    this.isLoading = false;
    this.enableUI();
  }

  clearChanges() {
    if (this.isLoading) {
      return;
    }
    this.isProcessing = true;
    this.disableUI(ProcessingMessages.RESET);
    this.clearCurrentChanges();
    this.isProcessing = false;
    this.enableUI();
  }

  private clearCurrentChanges() {
    // Reset each page's settings to the previous saved value;
    this.currentPage.settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        if(!(setting.isDisabled || setting.isButton) ) {
          if (setting.type === SettingType.SELECT) {
            if (setting.options && setting.options.length) {
              const defaultIdx = setting.options.findIndex(option => option.isCurrent);
              if ( defaultIdx > -1) {
                setting.newValue = setting.options[defaultIdx].value;
              }
            }
          } else {
            setting.newValue = setting.currentValue;
          }
        }
        setting.errorMsg = '';
      })
    });
    this.currentPage.isChanged = false;
  }

  private loadTabData() {
    // Load the current values for each of the current tab data's.

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
}
