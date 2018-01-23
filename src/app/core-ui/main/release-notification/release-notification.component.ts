import { Component, OnInit } from '@angular/core';

import { environment } from '../../../../environments/environment';
import { ReleaseNotification } from './release-notification.model';

import { ClientVersionService } from '../../../core/http/client-version.service';

@Component({
  selector: 'app-release-notification',
  templateUrl: './release-notification.component.html',
  styleUrls: ['./release-notification.component.scss']
})
export class ReleaseNotificationComponent implements OnInit {

  public currentClientVersion: string = environment.version;
  public latestClientVersion: string;
  public releaseUrl: string;

  constructor(private clientVersionService: ClientVersionService) { }

  ngOnInit() {
    // check new update in every 30 minute
    setTimeout(this.getCurrentClientVersion(), 1800000);
  }

  getCurrentClientVersion() {
    this.clientVersionService.getCurrentVersion().subscribe((response: ReleaseNotification) => {
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
