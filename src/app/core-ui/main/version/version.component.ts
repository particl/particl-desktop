import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { VersionModel } from './version.model';
import { ClientVersionService } from 'app/core/http/client-version.service';
import { isPrerelease } from 'app/core/util/utils';
import { Log } from 'ng2-logger';
import { RpcService } from 'app/core/rpc/rpc.service';

import * as marketConfig from '../../../../../modules/market/config.js';

enum VersionText {
  latest = 'This is the latest client version',
  outdated = 'Newer version available, please update!',
  unknown = 'Unable to check for latest available version',
  updateCheck = 'Checking for newer version...'
}

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss']
})

export class VersionComponent implements OnInit, OnDestroy {

  @Input() daemonVersion: string = '';
  public clientVersion: string = environment.version;
  public marketVersion: string = environment.marketVersion;
  public isClientLatest: boolean = true;
  public isUpdateProcessing: boolean = false;
  public clientUpdateText: string = '';
  public isMarketWallet: boolean = false;
  private destroyed: boolean = false;
  private log: any = Log.create('VersionComponent');

  constructor(
    private clientVersionService: ClientVersionService,
    private _rpc: RpcService
  ) { }

  ngOnInit() {
    this.isMarketWallet = (marketConfig.allowedWallets || []).includes(this._rpc.wallet);
    // Initially need to call to verify the client version
    this.getCurrentClientVersion()
    // check new update in every 30 minute
    const versionInterval = interval(1800000);
    versionInterval.pipe(takeWhile(() => !this.destroyed)).subscribe(val => this.getCurrentClientVersion());
  }

  // no need to destroy.
  ngOnDestroy() {
    this.destroyed = true;
  }

  private getCurrentClientVersion() {
    this.clientUpdateText = VersionText.updateCheck;
    this.isUpdateProcessing = true;
    this.log.i('Checking for new client version...');
    this.clientVersionService.getCurrentVersion()
      .subscribe((response: VersionModel) => {
        this.log.i('version check response: ', response);
        if (response.tag_name) {
          this.isClientLatest = !this.isNewerVersion(this.clientVersion, response.tag_name);
          this.clientUpdateText = this.isClientLatest ? VersionText.latest : VersionText.outdated;
        }
        this.isUpdateProcessing = false;
      }, (error) => {
        this.clientUpdateText = VersionText.unknown;
        this.log.er('client version checking error: ', error);
    })
  }

  private isNewerVersion(sourceVersion: string, targetVersion: string): boolean {
    const averParts = sourceVersion.split('-');
    const bverParts = targetVersion.split('-');

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
      if (!isPrerelease(sourceVersion) && isPrerelease(targetVersion)) {
        isBNewer = false;
      }
    }
    return isBNewer;
  }
}
