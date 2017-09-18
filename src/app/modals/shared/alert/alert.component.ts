import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { Log } from 'ng2-logger';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  public title: string;
  public text: string;
  log: any = Log.create('alertbox.component');

  constructor() { }

  ngOnInit() {
  }

  open(text: string, title?: string) {
    if (text) {
      this.text = text;
    }

    if (title) {
      this.title = title;
    }
  }

}
