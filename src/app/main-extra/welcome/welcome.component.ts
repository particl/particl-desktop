import { Component, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { Select } from '@ngxs/store';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';
import { RunningStatus } from 'app/networks/particl/particl.models';
import { ParticlCoreState } from 'app/networks/particl/particl.state';

import { routes } from 'app/main/main-routing.module';

import { MotdService, MessageQuote } from 'app/core/services/motd.service';

@Component({
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnDestroy {

  readonly appmodules: {route: string; icon: string; title: string, desc: string}[] = [];

  @Select(ApplicationConfigState.moduleVersions('app')) clientVersion$: Observable<string>;
  @Select(ParticlCoreState.getStatusMessage) particlCoreStatus: Observable<string>;
  @Select(ParticlCoreState.getStartedStatus) particlCoreStartedIndicator: Observable<RunningStatus>;

  RunningStatuses: typeof RunningStatus = RunningStatus;

  motd: MessageQuote = {author: '', text: ''};

  private destroy$: Subject<void> = new Subject();

  constructor(
    private _motdService: MotdService,
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

}
