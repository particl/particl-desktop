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
    this.getCurrentClientVersion();
  }

  getCurrentClientVersion() {
    this.http.get('https://api.github.com/repos/particl/partgui/releases/latest').subscribe((response: ReleaseNotification) => {
      this.latestClientVersion = response.tag_name;
      this.releaseUrl = response.html_url;
    });
  }

}
