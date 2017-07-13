import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../../modals.service';

@Component({
  selector: 'app-showpassphrase',
  templateUrl: './showpassphrase.component.html',
  styleUrls: ['./showpassphrase.component.scss']
})
export class ShowpassphraseComponent {

  constructor (
    @Inject(forwardRef(() => ModalsService)) private _modalsService: ModalsService
  ) { }

  back() {
    this._modalsService.open('generate');
  }

  next() {
    this._modalsService.open('confirmPassphrase');
  }

}
