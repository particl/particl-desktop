import { Component } from '@angular/core';

@Component({
  selector: 'app-daemon',
  templateUrl: './daemon.component.html',
  styleUrls: ['./daemon.component.scss']
})
export class DaemonComponent {

  public message: any;

  constructor() { }

  setData(data: any) {
    this.message = data;
  }

}
