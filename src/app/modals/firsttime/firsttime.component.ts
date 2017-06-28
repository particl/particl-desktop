import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../modals.service';

@Component({
  selector: 'modal-firsttime',
  templateUrl: './firsttime.component.html',
  styleUrls: ['./firsttime.component.scss']
})
export class FirsttimeComponent {

  constructor (
    @Inject(forwardRef(() => ModalsService)) private _modalsService: ModalsService
  ) { }

  create () {
    this._modalsService.open('generatewallet');
  }

  restore() {
    this._modalsService.open('recover');
  }

}
