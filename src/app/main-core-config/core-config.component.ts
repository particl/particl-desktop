import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { Particl } from 'app/networks/networks.module';
import { RunningStatus } from 'app/networks/particl/particl.models';
import { merge, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { childRoutes } from './core-config.routes';
import { CoreConfigurationService } from './core-config.service';


interface IMenuItem {
  text: string;
  path: string;
  icon?: string;
}

interface ICoreStatus {
  isStarted: boolean;
  canStart: boolean;
  canStop: boolean;
  actionLabel: string;
  statusLabel: string;
  icon: string;
}


enum TextContent {
  CORE_STATUS_STARTING = 'Starting Particl Core...',
  CORE_STATUS_STARTED = 'Started Particl Core',
  CORE_STATUS_STOPPING = 'Stopping Particl Core...',
  CORE_STATUS_STOPPED = 'Stopped Particl Core',
  CORE_ACTION_START = 'Start Particl Core',
  CORE_ACTION_STOP = 'Stop Particl Core',
}

enum Icons {
  CORE_ICON_START = 'part-globe',
  CORE_ICON_STOP = 'part-cross'
}


@Component({
  templateUrl: './core-config.component.html',
  styleUrls: ['./core-config.component.scss']
})
export class CoreConfigComponent implements OnInit, OnDestroy {

  readonly menu: IMenuItem[] = [];
  readonly startedStatus: ICoreStatus = {
    isStarted: false,
    canStart: false,
    canStop: false,
    actionLabel: '',
    statusLabel: TextContent.CORE_STATUS_STOPPED,
    icon: '',
  };

  coreActionStatus: string = '';

  private destroy$: Subject<void> = new Subject();


  constructor(
    private _store: Store,
    private _coreConfigService: CoreConfigurationService,
  ) {
    if (Array.isArray(childRoutes)) {
      childRoutes.forEach(cr => {
        if (
          Object.prototype.toString.call(cr) === '[object Object]'
          && typeof cr.path === 'string'
          && Object.prototype.toString.call(cr.data) === '[object Object]'
          && typeof cr.data.pathName === 'string'
        ) {
          this.menu.push({ path: cr.path, text: cr.data.pathName })
        }
      });
    }

    this._coreConfigService._init();
  }


  ngOnInit() {
    merge(
      this._store.select(Particl.State.Core.getStatusMessage).pipe(
        tap(message => this.coreActionStatus = message),
        takeUntil(this.destroy$)
      ),

      this._store.select(Particl.State.Core.getStartedStatus).pipe(
        map((startedStatus) => {
          const newStatusData: ICoreStatus = {
            canStart: false,
            canStop: false,
            isStarted: false,
            statusLabel: '',
            actionLabel: TextContent.CORE_ACTION_START,
            icon: Icons.CORE_ICON_START,
          };

          switch(startedStatus) {
            case RunningStatus.STARTED:
              newStatusData.canStop = true;
              newStatusData.isStarted = true;
              newStatusData.icon = Icons.CORE_ICON_STOP;
              newStatusData.actionLabel = TextContent.CORE_ACTION_STOP;
              break;
            case RunningStatus.STOPPED:
              newStatusData.canStart = true;
              newStatusData.icon = Icons.CORE_ICON_START;
              newStatusData.actionLabel = TextContent.CORE_ACTION_START;
              break;
            case RunningStatus.STARTING:
              newStatusData.canStop = true;
              newStatusData.statusLabel = TextContent.CORE_STATUS_STARTING;
              newStatusData.icon = Icons.CORE_ICON_STOP;
              newStatusData.actionLabel = TextContent.CORE_ACTION_STOP;
              break;
            case RunningStatus.STOPPING:
              newStatusData.statusLabel = TextContent.CORE_STATUS_STOPPING;
              break;
          }

          return newStatusData;
        }),
        tap({
          next: (newStatus) => {
            this.startedStatus.isStarted = newStatus.isStarted;
            this.startedStatus.canStart = newStatus.canStart;
            this.startedStatus.canStop = newStatus.canStop;
            this.startedStatus.actionLabel = newStatus.actionLabel;
            this.startedStatus.statusLabel = newStatus.statusLabel;
            this.startedStatus.icon = newStatus.icon;
          }
        }),
        takeUntil(this.destroy$)
      )
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this._coreConfigService._teardown();
  }


  actionCoreStatus(): void {
    if (this.startedStatus.canStart || this.startedStatus.canStop) {
      this._store.dispatch(new Particl.Actions.RequestAction(this.startedStatus.canStart ? 'start' : 'stop'));
      this.startedStatus.canStart = false;
      this.startedStatus.canStop = false;
    }
  }
}
