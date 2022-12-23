import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Select } from '@ngxs/store';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, startWith, take, takeUntil } from 'rxjs/operators';

import { routes } from 'app/main/main-routing.module';
import { Particl } from 'app/networks/networks.module';
import { ConsoleModalComponent } from '../console-modal/console-modal.component';
import { NetworkInitService } from 'app/main/services/network-init/network-init.service';


@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent implements OnDestroy {

  readonly apps: {
    class: string;
    route: string;
    icon: string;
    title: string;
    activatorObs: Observable<boolean>;
  }[] = [];

  @Select(Particl.State.Core.isRunning()) isCoreStarted$: Observable<boolean>;

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _dialog: MatDialog,
    private _networkInitService: NetworkInitService,
  ) {

    routes.forEach(r => {
      if (r.children) {
        r.children.forEach(rc => {
          if (rc.data && rc.data.showShortcut === true) {
            this.apps.push({
              route: rc.path,
              class: `${rc.path} app`,
              icon: rc.data.icon || '',
              title: rc.data.title || '',
              activatorObs: this.getRouteActivationObservable(rc.data.networkDependencies),
            });
          }
        });
      }
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openConsoleWindow(): void {
    this.isCoreStarted$.pipe(take(1)).subscribe(
      (isStarted) => {
        if (isStarted) {
          this._dialog.open(ConsoleModalComponent);
        }
      }
    );
  }


  private getRouteActivationObservable(networkDependencies: string[] | string): Observable<boolean> {
    const deps = [];
    if (Array.isArray(networkDependencies)) {
      networkDependencies.filter(key => typeof key === 'string' && key.length > 0).forEach(dep => deps.push(dep));
    }
    if (typeof networkDependencies === 'string' && networkDependencies.length > 0) {
      deps.push(networkDependencies);
    }

    if (deps.length === 0) {
      return of(true);
    }

    return combineLatest(
      deps.map(dep => this._networkInitService.monitorNetworkStartedStatus(dep).pipe(takeUntil(this.destroy$)))
    ).pipe(
      map(statuses => statuses.every(status => status === true)),
      startWith(false),
      takeUntil(this.destroy$)
    );

  }
}
