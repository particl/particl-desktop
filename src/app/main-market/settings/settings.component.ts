import { OnInit, AfterViewInit, OnDestroy, ViewChild, ViewContainerRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentFactoryResolver } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subject, of, timer, iif, defer, combineLatest } from 'rxjs';
import { tap, takeUntil, concatMap, catchError, switchMap, mapTo, map, distinctUntilChanged } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { ParticlRpcService } from 'app/networks/networks.module';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketConsoleModalComponent } from './market-console-modal/market-console-modal.component';
import { GeneralConfigComponent } from './setting-categories/general-config/general-config.component';
import { ModuleSettingsComponent } from './setting-categories/module-settings/module-settings.component';
import { StartedStatus } from '../store/market.models';
import { RPCResponses } from 'app/networks/particl/particl.models';
import { MarketStateActions, MarketUserActions } from '../store/market.actions';


enum TextContent {
  Error_SMSGRescan = 'Failed to rescan smsg content',
}


interface SettingCategory {
  label: string;
  icon: string;
  component: any;
}


@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketSettingsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('settingPageCategory', {static: false, read: ViewContainerRef}) categoryPageContainer: ViewContainerRef;

  readonly pageDetails: Readonly<{title: string; description: string; help: string}> = Object.freeze({
    title: 'Market Settings',
    description: 'Adjust settings and configuration that apply only to the market application',
    help: 'For configuration of global app settings, click the settings icon in bottom left corner'
  });

  readonly settingsMenu: Readonly<SettingCategory[]> = Object.freeze([
    {
      label: 'Market Profile Settings',
      icon: 'part-people',
      component: GeneralConfigComponent
    },
    {
      label: 'Network & Connection',
      icon: 'part-globe',
      component: ModuleSettingsComponent
    },
  ]);

  startedStatus: StartedStatus;
  isSmsgRecanButtonEnabled: boolean = false;

  STARTEDSTATUS: typeof StartedStatus = StartedStatus;  // Template typings

  private _currentMenuIdx: number = -1;
  private destroy$: Subject<void> = new Subject();


  constructor(
    private _resolver: ComponentFactoryResolver,
    private _cdr: ChangeDetectorRef,
    private _store: Store,
    private _particlRpc: ParticlRpcService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
  ) { }


  ngOnInit() {
    const statusChange$ = this._store.select(MarketState.startedStatus).pipe(
      tap({
        next: (startedStatus) => {

          if (this.startedStatus !== startedStatus) {
            this.startedStatus = startedStatus;
            this._cdr.detectChanges();
          }
        }
      }),
      map((startedStatus) => startedStatus === StartedStatus.STARTED),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const smsgButton$ = this._store.select(MarketState.lastSmsgScan).pipe(
      switchMap(timestamp => iif(
        () => (timestamp + 30_000) < Date.now(),
        defer(() => of(true)),
        defer(() => of(false))
      )),
      takeUntil(this.destroy$)
    );

    combineLatest([
      statusChange$,
      smsgButton$,
    ]).pipe(
      tap({
        next: ([started, buttonEnabled]) => {
          if ((started && buttonEnabled) !== this.isSmsgRecanButtonEnabled) {
            this.isSmsgRecanButtonEnabled = (started && buttonEnabled);
            this._cdr.detectChanges();
          }
        }
      }),
      switchMap(([started, buttonEnabled]) => iif(
        () => started && !buttonEnabled && this._store.selectSnapshot(MarketState.lastSmsgScan) < (Date.now() + 1_000),
        defer(() => timer(this._store.selectSnapshot(MarketState.lastSmsgScan) + 30_000 - Date.now()).pipe(mapTo(started), takeUntil(this.destroy$))),
        defer(() => of(started))
      )),
      tap({
        next: () => {
          const canEnable = this.startedStatus === StartedStatus.STARTED;
          if (this.isSmsgRecanButtonEnabled !== canEnable) {
            this.isSmsgRecanButtonEnabled = canEnable;
            this._cdr.detectChanges();
          }
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngAfterViewInit(): void {
    this.changeSelectedMenu(0);
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get currentMenuIdx(): number {
    return this._currentMenuIdx;
  }


  changeSelectedMenu(idx: number) {
    if (idx >= 0 && idx < this.settingsMenu.length && idx !== this._currentMenuIdx) {
      this._currentMenuIdx = idx;
      this.categoryPageContainer.clear();
      const compFactory = this._resolver.resolveComponentFactory(this.settingsMenu[this._currentMenuIdx].component);
      this.categoryPageContainer.createComponent(compFactory);
      this._cdr.detectChanges();
    }
  }


  launchMarketConsole() {
    if (this.startedStatus !== StartedStatus.STARTED) {
      return;
    }
    this._dialog.open(MarketConsoleModalComponent);
  }


  rescanSmsgMessages() {
    if (!this.isSmsgRecanButtonEnabled) {
      return;
    }
    this._particlRpc.call<RPCResponses.SmsgScanBuckets>('smsgscanbuckets').pipe(
      concatMap(() => this._store.dispatch(new MarketUserActions.SetSetting('profile.marketsLastAdded', 0))),
      catchError(() => {
        this._snackbar.open(TextContent.Error_SMSGRescan, 'warn');
        return of(null);
      })
    ).subscribe();
  }


  restartMarketplace() {
    this._store.dispatch(new MarketStateActions.RestartMarketService());
  }
}
