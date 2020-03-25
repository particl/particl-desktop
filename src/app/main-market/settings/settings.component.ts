import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { Observable, Subject, from } from 'rxjs';
import { tap, takeUntil, take, finalize, concatMap } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';

import { MarketActions } from '../store/market.actions';
import { StartedStatus, MarketSettings } from '../store/market.models';
import {
  PageInfo,
  TextContent,
  SettingType,
  SettingGroup,
  Setting
} from 'app/main-extra/global-settings/settings.types';


@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class MarketSettingsComponent implements OnInit, OnDestroy {

  startedStatus: StartedStatus;
  STARTEDSTATUS: typeof StartedStatus = StartedStatus;  // Template typings
  settingType: (typeof SettingType) = SettingType;      // Template typings

  settingGroups: SettingGroup[] = [];
  isProcessing: boolean = false;   // Indicates that the current page is busy processing a change.
  currentChanges: number[][] = []; // (convenience helper) Tracks which setting items on the current page have changed

  readonly pageDetails: PageInfo = {
    title: 'Market Settings',
    description: 'Adjust settings and configuration that apply only to the market application',
    help: 'For configuration of global app settings, click the settings icon in bottom right corner'
  } as PageInfo;

  private _currentGroupIdx: number = 0;


  private destroy$: Subject<void> = new Subject();

  constructor(
    private _store: Store,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
  ) {
    this._store.select(MarketState.startedStatus).pipe(
      tap((status) => this.startedStatus = status),
      takeUntil(this.destroy$)
    ).subscribe();
  }


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
        if (setting.formatValue) {
          setting.formatValue = setting.formatValue.bind(setting);
        } else {
          setting.formatValue = () => setting.newValue;
        }
      });

      this.currentChanges.push([]);
    });
    this.clearChanges();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get preventSaving(): boolean {
    return this.isProcessing ||
        (this.startedStatus === StartedStatus.PENDING) ||
        !this.hasChanges ||
        (this.settingGroups.findIndex(group => group.errors.length > 0) > -1);
  }

  get hasChanges(): boolean {
    return this.currentChanges.findIndex(group => group.length > 0) > -1;
  }


  get currentGroup(): SettingGroup {
    return this.settingGroups[this._currentGroupIdx];
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

    setting.newValue = setting.formatValue();

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


  restartMarketplace() {
    this._store.dispatch(new MarketActions.StartMarketService());
  }


  launchMarketConsole() {
    // TODO!!!!!!!!!!!! IMPLEMENT THIS
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
            actions.push(new MarketActions.SetSetting(setting.id, setting.newValue));
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
        null,
        () => {
          observer.complete();
        }
      );
    });
  }


  private actionRestartApplication() {
    this._store.dispatch(new MarketActions.StopMarketService());
    // Give the MP service some time to shut down correctly
    setTimeout(() => this.restartMarketplace(), 1500);
  }


  private loadPageData() {

    const marketSettings: MarketSettings = this._store.selectSnapshot(MarketState.settings);

    const connectionDetails = {
      name: 'Connection Details',
      icon: 'part-globe',
      settings: [],
      errors: []
    } as SettingGroup;


    connectionDetails.settings.push({
      id: 'port',
      title: 'Market Connection Port',
      description: 'Change the port that the market application starts on',
      isDisabled: false,
      type: SettingType.STRING,
      limits: {placeholder: 'example: 3000' },
      errorMsg: '',
      currentValue: marketSettings.port,
      tags: [],
      restartRequired: true,
      validate: this.validatePortNumber,
      formatValue: this.formatPortSetting,
    } as Setting);


    this.settingGroups.push(connectionDetails);

  }


  private formatPortSetting() {
    // 'this' here is bound to the setting instance, so referenced like this to prevent TS issues thinking its the component instance
    return +(this['newValue']);
  }


  private validatePortNumber(value: any, setting: Setting): string | null {
    const port = +value;
    return port > 0 && port <= 65535 ? null : 'Invalid port number';
  }

}
