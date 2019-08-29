import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {

  public title: string;
  public text: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data.title) {
      this.title = data.title;
    }

    if (data.text) {
      this.text = data.text;
    }
  }
}
