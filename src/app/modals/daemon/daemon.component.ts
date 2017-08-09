import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../modals.service';

@Component({
  selector: 'app-daemon',
  templateUrl: './daemon.component.html',
  styleUrls: ['./daemon.component.scss']
})
export class DaemonComponent {

  private _message: any;

  constructor(
    @Inject(forwardRef(() => ModalsService)) private _modalsService: ModalsService
  ) {
  }

  setData(data: any) {
    this._message = data;
  }

}
