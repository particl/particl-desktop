import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';
import { ReleaseNotification } from './release-notification.model';

@Component({
  selector: 'app-release-notification',
  templateUrl: './release-notification.component.html',
  styleUrls: ['./release-notification.component.scss']
})
export class ReleaseNotificationComponent implements OnInit {

  public currentClientVersion: string = environment.version;
  public latestClientVersion: string;
  public releaseUrl: string;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    // check new update in every 30 minute
    setTimeout(this.getCurrentClientVersion(), 1800000);
  }

  getCurrentClientVersion() {
    this.http.get('https://api.github.com/repos/particl/particl-desktop/releases/latest').subscribe((response: ReleaseNotification) => {
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
