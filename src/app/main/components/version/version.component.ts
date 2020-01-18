import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { isPrerelease } from 'app/core/util/utils';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { AppDataState } from 'app/core/store/appdata.state';

enum VersionText {
  latest = 'This is the latest client version',
  outdated = 'Newer app version available',
  updateCheck = 'Checking for newer version...'
}

@Component({
  selector: 'main-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss']
})

export class VersionComponent implements OnInit, OnDestroy {
  public clientVersion: string = environment.version;
  public newVersion: string = '';
  public isClientLatest: boolean = true;
  public clientUpdateText: string = '';

  public daemonVersion: string = '';

  private log: any = Log.create('version.component.id: ' + Math.floor((Math.random() * 1000) + 1));
  private destroy$: Subject<void> = new Subject();
  private isMarketActive: boolean = false;
  private _marketVersion: string = environment.marketVersion;


  constructor(
    private _store: Store
  ) { }

  ngOnInit() {
    const client$ = this._store.select(AppDataState.versionValue('latestClient')).pipe(
      tap((version: string) => {
        this.log.d('received app version check info: ', version);
        this.newVersion = version;
        this.isClientLatest = version.length > 0 ? !this.isNewerVersion(this.clientVersion, this.newVersion) : this.isClientLatest;
      }),
      tap(() => {
        this.clientUpdateText = this.newVersion.length > 0 ?
          (this.isClientLatest ? VersionText.latest : `${VersionText.outdated} (${this.newVersion})`) :
          VersionText.updateCheck;
      })
    );

    const daemon$ = this._store.select(AppDataState.networkValue('subversion')).pipe(
      tap((version: string) => {
        this.log.d('received daemon version: ', version);
        if (version) {
          this.daemonVersion = version.match(/\d+\.\d+.\d+.\d+/)[0];
        }
      })
    );

    merge(
      client$,
      daemon$
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  // no need to destroy.
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get marketVersion(): string {
    return this.isMarketActive ? this._marketVersion : '';
  }

  get preRelease(): string {
    return environment.preRelease || '';
  }


  private isNewerVersion(sourceVersion: string, targetVersion: string): boolean {
    const averParts = sourceVersion.split('-');
    const bverParts = (targetVersion.startsWith('v') ? targetVersion.substring(1) : targetVersion).split('-');

    const aVerNums = String(averParts[0] || '').split('.');
    const bVerNums = String(bverParts[0] || '').split('.');

    let isBNewer = false;
    for (let ii = 0; ii < aVerNums.length; ii++) {
      const aNum = aVerNums[ii] === undefined ? 0 : +aVerNums[ii];
      const bNum = bVerNums[ii] === undefined ? 0 : +bVerNums[ii];

      if (aNum === bNum) {
        continue;
      }

      isBNewer = bNum > aNum;
      break;
    }

    if (isBNewer) {
      // Ensure that the targetVersion is not a pre-release version if currentVersion is not a pre-release version
      if (!isPrerelease() && isPrerelease(targetVersion)) {
        isBNewer = false;
      }
    }
    return isBNewer;
  }
}
