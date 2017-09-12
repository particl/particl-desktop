import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { Log } from 'ng2-logger';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  @ViewChild('alertBox')
  public alertBox: ModalDirective;

  @Input()
  text: string;

  @Input()
  title: string = 'Alert';

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

    this.show();
  }

  show() {
    this.alertBox.show();
  }

  hide() {
    this.alertBox.hide();
  }

}
