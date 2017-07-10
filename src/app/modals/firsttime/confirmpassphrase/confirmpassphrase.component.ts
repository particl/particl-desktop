import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../../modals.service';

@Component({
  selector: 'app-confirmpassphrase',
  templateUrl: './confirmpassphrase.component.html',
  styleUrls: ['./confirmpassphrase.component.scss']
})
export class ConfirmpassphraseComponent {

  constructor (
    @Inject(forwardRef(() => ModalsService)) private _modalsService: ModalsService
  ) { }

  back() {
    this._modalsService.open('showPassphrase');
  }

  next() {
    this._modalsService.open('finish');
  }

}
