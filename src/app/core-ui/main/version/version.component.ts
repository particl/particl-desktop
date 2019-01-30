import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { interval } from 'rxjs/observable/interval';

import { environment } from '../../../../environments/environment';
import { VersionModel } from './version.model';

import { ClientVersionService } from '../../../core/http/client-version.service';

export enum VersionText {
  outDated = 'Newer version available, please update!',
  unknown = 'Unable to check for latest available version'
}

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss']
})

export class VersionComponent implements OnInit, OnDestroy {

  @Input() daemonVersion: string = '';
  clientVersion: string = environment.version;
  marketVersion: string = environment.marketVersion;
  public latestClientVersion: string;
  public releaseUrl: string;
  private destroyed: boolean = false;

  constructor(private clientVersionService: ClientVersionService) { }

  ngOnInit() {
    // check new update in every 30 minute
    const versionInterval = interval(1800000);
    versionInterval.takeWhile(() => !this.destroyed).subscribe(val => this.getCurrentClientVersion());
  }

  // no need to destroy.
  ngOnDestroy() {
    this.destroyed = true;
  }

  getCurrentClientVersion() {
    this.clientVersionService.getCurrentVersion()
      .subscribe((response: VersionModel) => {
        if (response.tag_name) {
          this.latestClientVersion = response.tag_name.substring(1);
        }

        this.releaseUrl = response.html_url;
      }, (error) => {
        this.latestClientVersion = '';
    })
  }

  isNewUpdateAvailable(): boolean {
    return (parseFloat(this.clientVersion) < parseFloat(this.latestClientVersion));
  }

  alreadyUptoDate(): boolean {
    return (parseFloat(this.clientVersion) === parseFloat(this.latestClientVersion));
  }

  toolTipText(): string {
    if (this.isNewUpdateAvailable()) {
      return VersionText.outDated;
    }

    if (!this.latestClientVersion) {
      return VersionText.unknown;
    }

    return;
  }

}
