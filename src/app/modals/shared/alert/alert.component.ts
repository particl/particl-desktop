import { Component } from '@angular/core';

import { Log } from 'ng2-logger';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {

  public title: string;
  public text: string;
  log: any = Log.create('alertbox.component');

  constructor() { }

  open(text: string, title?: string): void {
    if (text) {
      this.text = text;
    }

    if (title) {
      this.title = title;
    }
  }

}
