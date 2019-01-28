import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval } from 'rxjs/observable/interval';

import { environment } from '../../../../environments/environment';
import { AnnounceMentNotification } from './announcement-notification.model';
import { ClientVersionService } from '../../../core/http/client-version.service';

import { MatDialog, MatDialogRef } from '@angular/material';
import { AlphaMainnetWarningComponent } from '../../../modals/alpha-mainnet-warning/alpha-mainnet-warning.component';

@Component({
  selector: 'app-announcement-notification',
  templateUrl: './announcement-notification.component.html',
  styleUrls: ['./announcement-notification.component.scss']
})
export class AnnounceMentNotificationComponent implements OnInit, OnDestroy {

  public currentClientVersion: string = environment.version;
  public latestClientVersion: string;
  public releaseUrl: string;
  private destroyed: boolean = false;
  private mainNet: boolean = false;
  constructor(
    private clientVersionService: ClientVersionService,
    public dialog: MatDialog // Alpha mainnet warning
  ) { }

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
      .subscribe((response: AnnounceMentNotification) => {
        if (response.tag_name) {
          this.latestClientVersion = response.tag_name.substring(1);
        }

        this.releaseUrl = response.html_url;
      });
  }

  isNewUpdateAvailable(): boolean {
    return (parseFloat(this.currentClientVersion) < parseFloat(this.latestClientVersion));
  }

  // check for beta version
  isAlpha(): boolean {
    return (this.currentClientVersion).includes('alpha');
  }

  // Alpha mainnet warning
  readFullWarning(): void {
    const dialogRef = this.dialog.open(AlphaMainnetWarningComponent);
  }

}
