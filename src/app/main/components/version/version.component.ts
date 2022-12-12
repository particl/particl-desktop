import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Select } from '@ngxs/store';
import { ApplicationConfigState } from 'app/core/app-global-state/app.state';
import { ParticlCoreState } from 'app/networks/particl/particl.state';
import { tap } from 'rxjs/operators';


enum VersionText {
  latest = 'This is the latest client version',
  outdated = 'Newer app version available',
}


@Component({
  selector: 'main-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss']
})
export class VersionComponent implements OnInit, OnDestroy {

  @Select(ApplicationConfigState.moduleVersions('app')) clientVersion$: Observable<string>;
  @Select(ParticlCoreState.version) daemonVersion$: Observable<string>;
  @Select(ApplicationConfigState.hasNewAppVersion) hasNewerClientVersion$: Observable<boolean>;
  public isClientLatest: boolean = true;  // @TODO!!! perform check and correct this
  public clientUpdateText: string = VersionText.latest;   // @TODO!!! perform check and correct this


  private destroy$: Subject<void> = new Subject();

  constructor() { }


  ngOnInit() {
    this.hasNewerClientVersion$.pipe(
      tap({
        next: (hasNewVersion) => {
          this.clientUpdateText = hasNewVersion ? VersionText.outdated : VersionText.latest;
        }
      })
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
