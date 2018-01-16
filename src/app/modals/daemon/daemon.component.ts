import { Component } from '@angular/core';

@Component({
  selector: 'app-daemon',
  templateUrl: './daemon.component.html',
  styleUrls: ['./daemon.component.scss']
})
export class DaemonComponent {

  public message: any;
  public daemonRunning: boolean;

  constructor() { }

  setData(data: any) {
    console.log(data);
    this.message = data;
    this.daemonRunning = data && data.daemonRunning;

}
