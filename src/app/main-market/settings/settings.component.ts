import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { Observable, Subject, from, concat, of } from 'rxjs';
import { tap, takeUntil, take, finalize, concatMap, catchError, concatMapTo } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { RegionListService } from '../shared/shared.module';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { MarketConsoleModalComponent } from './market-console-modal/market-console-modal.component';

import { MarketActions } from '../store/market.actions';
import { StartedStatus, MarketSettings, MarketStateModel } from '../store/market.models';
import {
  PageInfo,
  TextContent as DefaultTextContent,
  SettingType,
  SettingGroup,
  Setting
} from 'app/main-extra/global-settings/settings.types';


enum TextContent {
  FAILED_SAVE = 'An error occurred saving this value'
}

interface MarketSetting extends Setting {
  waitForServiceStart: boolean;
  _isDisabled: boolean;
}

interface MarketSettingGroup extends SettingGroup {
  settings: MarketSetting[];
}


@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class MarketSettingsComponent implements OnInit, OnDestroy {

  startedStatus: StartedStatus;
  STARTEDSTATUS: typeof StartedStatus = StartedStatus;  // Template typings
  settingType: (typeof SettingType) = SettingType;      // Template typings

  settingGroups: MarketSettingGroup[] = [];
  isProcessing: boolean = false;   // Indicates that the current page is busy processing a change.
  currentChanges: number[][] = []; // (convenience helper) Tracks which setting items on the current page have changed

  readonly pageDetails: PageInfo = {
    title: 'Market Settings',
    description: 'Adjust settings and configuration that apply only to the market application',
    help: 'For configuration of global app settings, click the settings icon in bottom right corner'
  } as PageInfo;


  private destroy$: Subject<void> = new Subject();
  private _currentGroupIdx: number = 0;
  private isWaitingForStartCall: boolean = false;


  constructor(
    private _store: Store,
    private _snackbar: SnackbarService,
    private _regionService: RegionListService,
    private _dialog: MatDialog,
  ) { }


  ngOnInit() {
    const stateChange$ = this._store.select(MarketState).pipe(
      tap((storeState: MarketStateModel) => {

        if (this.startedStatus !== storeState.started) {
          this.startedStatus = storeState.started;
        }

        if (this.isProcessing) {
          return;
        }

        const isEnabled = storeState.started === StartedStatus.STARTED;

        if (!isEnabled && !this.isWaitingForStartCall) {
          this.isWaitingForStartCall = true;

          for (const settingGroup of this.settingGroups) {
            for (const setting of settingGroup.settings) {
              if (setting.waitForServiceStart) {
                setting._isDisabled = setting.isDisabled;
                setting.isDisabled = true;
              }
            }
          }
        } else if (isEnabled) {
          this.isWaitingForStartCall = false;

          // reload relevant settings as the market service has now started and needs to be refreshed
          this.loadPageData().subscribe(
            (settingsData) => {
              this.settingGroups.forEach((group, groupIdx) => {
                group.settings.forEach((setting, settingIdx) => {
                  if (setting.waitForServiceStart) {
                    const updatedSetting = settingsData[groupIdx].settings[settingIdx];
                    this.bindSettingFunctions(updatedSetting);
                    this.resetSetting(updatedSetting);
                    this.settingGroups[groupIdx].settings[settingIdx] = updatedSetting;
                  }
                });
              });
            }
          );
        }
      }),
      takeUntil(this.destroy$)
    );

    this.loadPageData().pipe(
      tap((groups) => {
        groups.forEach((group: MarketSettingGroup) => {
          group.settings.forEach((setting: MarketSetting) => {
            this.bindSettingFunctions(setting);
          });
          this.currentChanges.push([]);
        });

        this.settingGroups = groups;
        this.clearChanges();
      }),
      take(1),
      concatMapTo(stateChange$)
    ).subscribe();
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
      this.currentChanges[groupIdx] = this.currentChanges[groupIdx].filter(idx => idx !== settingIdx);
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
        this.resetSetting(setting);
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
      this._snackbar.open(DefaultTextContent.ERROR_BUSY_PROCESSING, 'err');
      return;
    }
    this.isProcessing = true;

    this.disableUI(DefaultTextContent.SAVING);

    let requiresRestart = false;

    // Validation of each changed setting ensures current settings are not in an error state
    let hasError = false;
    let hasChanged = false;
    this.settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        if ( !(setting.type === SettingType.BUTTON)) {
          if (setting.currentValue !== setting.newValue) {
            hasChanged = true;
            if (setting.restartRequired) {
              requiresRestart = true;
            }

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
      const errMsg = !hasChanged ? DefaultTextContent.SAVE_NOT_NEEDED : DefaultTextContent.ERROR_INVALID_ITEMS;
      this.isProcessing = false;
      this.enableUI();
      this._snackbar.open(errMsg, 'err');
      return;
    }

    concat(
      // save changes
      this.saveActualChanges().pipe(
        take(1),
        catchError(() => {
          this._snackbar.open(DefaultTextContent.SAVE_FAILED, 'err');
          return of(false);
        })
      ),

      // request and process updated settings values (determine if everything changed successfully)
      this.loadPageData().pipe(
        tap((refreshedGroups) => {
          this.settingGroups.forEach((group, groupIdx) => {
            group.settings.forEach((setting, settingIdx) => {
              if (setting.type !== SettingType.BUTTON) {
                const updatedSetting = refreshedGroups[groupIdx].settings[settingIdx];

                if (setting.id === updatedSetting.id) {
                  if (setting.newValue !== updatedSetting.currentValue) {
                    setting.errorMsg = TextContent.FAILED_SAVE;
                    group.errors.push(settingIdx);
                  } else {
                    setting.errorMsg = '';
                    group.errors = group.errors.filter(si => si !== settingIdx);
                    this.currentChanges[groupIdx] = this.currentChanges[groupIdx].filter(si => si !== settingIdx);
                  }
                }
              }
            });
          });
        })
      )
    ).pipe(
      finalize(() => {
        this.isProcessing = false;
        this.enableUI();
      })
    ).subscribe(
      () => {
        if (!this.hasChanges) {
          this._snackbar.open(DefaultTextContent.SAVE_SUCCESSFUL);

          if (requiresRestart) {
            this.restartMarketplace();
          }
        } else {
          this._snackbar.open(DefaultTextContent.SAVE_FAILED, 'err');
        }
      }
    );
  }


  restartMarketplace() {
    this._store.dispatch(new MarketActions.RestartMarketService());
  }


  launchMarketConsole() {
    if (this.startedStatus !== StartedStatus.STARTED) {
      return;
    }
    this._dialog.open(MarketConsoleModalComponent);
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
        null,
        null,
        () => {
          observer.next(restartRequired);
          observer.complete();
        }
      );
    });
  }


  private loadPageData(): Observable<MarketSettingGroup[]> {

    return new Observable((observer) => {

      const groups: MarketSettingGroup[] = [];

      const marketState: MarketStateModel = this._store.selectSnapshot(MarketState);
      const marketSettings: MarketSettings = marketState.settings;

      const connectionDetails: MarketSettingGroup = {
        name: 'Marketplace Defaults',
        icon: 'part-globe',
        settings: [],
        errors: []
      };


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
        formatValue: this.formatToNumber,
        waitForServiceStart: false,
      } as MarketSetting);


      connectionDetails.settings.push({
        id: 'profile.defaultIdentityID',
        title: 'Default Identity',
        description: 'Set the selected identity as the initial selected identity',
        isDisabled: false,
        type: SettingType.SELECT,
        errorMsg: '',
        options: marketState.identities.map(id => ({text: id.displayName, value: id.id})),
        currentValue: marketSettings.defaultIdentityID,
        tags: [],
        restartRequired: false,
        formatValue: this.formatToNumber,
        waitForServiceStart: true
      } as MarketSetting);


      connectionDetails.settings.push({
        id: 'userRegion',
        title: 'Default Shipping Region',
        description: 'The region to default shipping calculation costs to',
        isDisabled: false,
        type: SettingType.SELECT,
        errorMsg: '',
        options: this._regionService.getCountryList().map(c => ({text: c.name, value: c.iso})),
        currentValue: marketSettings.userRegion,
        tags: [],
        restartRequired: false,
        waitForServiceStart: true
      } as MarketSetting);


      groups.push(connectionDetails);

      observer.next(groups);
      observer.complete();
    });

  }


  private formatToNumber() {
    // 'this' here is bound to the setting instance, so referenced like this to prevent TS issues thinking its the component instance
    return +(this['newValue']);
  }


  private validatePortNumber(value: any, setting: Setting): string | null {
    const port = +value;
    return port > 0 && port <= 65535 ? null : 'Invalid port number';
  }


  private bindSettingFunctions(setting: MarketSetting) {
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
  }


  private resetSetting(setting: MarketSetting) {
    if (setting.type !== SettingType.BUTTON) {
      setting.newValue = setting.currentValue;
    }
    setting.errorMsg = '';
  }

}
