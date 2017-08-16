import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../modals.service';

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
