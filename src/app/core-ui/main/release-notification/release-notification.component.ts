import { Component, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { ReleaseNotification } from './release-notification.model';

import { ClientVersionService } from '../../../core/http/client-version.service';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-release-notification',
  templateUrl: './release-notification.component.html',
  styleUrls: ['./release-notification.component.scss']
})
export class ReleaseNotificationComponent implements OnInit, OnDestroy {

  public currentClientVersion: string = environment.version;
  public latestClientVersion: string;
  public releaseUrl: string;
  private destroyed: boolean = false;

  constructor(private clientVersionService: ClientVersionService) { }

  ngOnInit() {
    this.getCurrentClientVersion();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  getCurrentClientVersion() {
    // check new update in every 30 minute
    this.clientVersionService.getCurrentVersion()
      .throttle(val => Observable.interval(1800000/*ms*/))
      .takeWhile(() => !this.destroyed)
      .subscribe((response: ReleaseNotification) => {
        if (response.tag_name) {
          this.latestClientVersion = response.tag_name.substring(1);
        }

        this.releaseUrl = response.html_url;
      });
  }

  isNewUpdateAvailable(): boolean {
    return (parseFloat(this.currentClientVersion) < parseFloat(this.latestClientVersion));
  }

}
