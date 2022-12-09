import { Component, OnDestroy } from '@angular/core';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { Select } from '@ngxs/store';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';
import { RunningStatus } from 'app/networks/particl/particl.models';
import { ParticlCoreState } from 'app/networks/particl/particl.state';

import { routes } from 'app/main/main-routing.module';

import { MotdService, MessageQuote } from 'app/core/services/motd.service';
import { NetworkInitService } from 'app/main/services/network-init/network-init.service';


@Component({
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnDestroy {

  readonly appmodules: {
    route: string;
    icon: string;
    title: string;
    desc: string;
    activatorObs: Observable<boolean>;
  }[] = [];

  @Select(ApplicationConfigState.moduleVersions('app')) clientVersion$: Observable<string>;
  @Select(ParticlCoreState.getStatusMessage) particlCoreStatus: Observable<string>;
  @Select(ParticlCoreState.getStartedStatus) particlCoreStartedIndicator: Observable<RunningStatus>;

  RunningStatuses: typeof RunningStatus = RunningStatus;

  motd: MessageQuote = {author: '', text: ''};

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _motdService: MotdService,
    private _networkInitService: NetworkInitService,
  ) {
    this._motdService.motd.pipe(
      tap((motd) => this.motd = motd),
      takeUntil(this.destroy$)
    ).subscribe();

    routes.forEach(r => {
      if (r.children) {
        r.children.forEach(rc => {
          if (rc.data) {
            this.appmodules.push({
              route: `/main/${rc.path}`,
              icon: rc.data.icon || '',
              title: rc.data.title || '',
              desc: rc.data.description || '',
              activatorObs: this.getRouteActivationObservable(rc.data.networkDependencies),
            });
          }
        });
      }
    });
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
