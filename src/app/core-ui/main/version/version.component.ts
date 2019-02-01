import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { interval } from 'rxjs/observable/interval';
import { environment } from '../../../../environments/environment';
import { VersionModel } from './version.model';
import { ClientVersionService } from '../../../core/http/client-version.service';
import { Log } from 'ng2-logger';

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
  private destroyed: boolean = false;
  private log: any = Log.create('VersionComponent');

  constructor(private clientVersionService: ClientVersionService) { }

  ngOnInit() {
    // Initially need to call to verify the client version
    this.getCurrentClientVersion()
    // check new update in every 30 minute
    const versionInterval = interval(1800000);
    versionInterval.takeWhile(() => !this.destroyed).subscribe(val => this.getCurrentClientVersion());
  }

  // no need to destroy.
  ngOnDestroy() {
    this.destroyed = true;
  }

  getCurrentClientVersion() {
    this.clientUpdateText = VersionText.updateCheck;
    this.isUpdateProcessing = true;
    this.log.i('Checking for new client version...');
    this.clientVersionService.getCurrentVersion()
      .subscribe((response: VersionModel) => {
        this.log.i('version check response: ', response);
        if (response.tag_name) {
          this.isClientLatest = parseFloat(this.clientVersion) >= parseFloat(response.tag_name);

          if (this.isClientLatest) {
            this.clientUpdateText = VersionText.latest;
          } else {
            this.clientUpdateText = VersionText.outdated;
          }
        }
        this.isUpdateProcessing = false;
      }, (error) => {
        this.clientUpdateText = VersionText.unknown;
        this.log.e('client version checking error: ', error);
    })
  }
}
