import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../modals.service';

@Component({
  selector: 'app-recoverwallet',
  templateUrl: './recoverwallet.component.html',
  styleUrls: ['./recoverwallet.component.scss']
})
export class RecoverwalletComponent {

  words: string[] = Array(24).fill('');

  constructor (
    @Inject(forwardRef(() => ModalsService)) private _modalsService: ModalsService
  ) { }

  restore(password: string) {
    // TODO API call
    console.log(this.words, password);
  }

  back() {
    this._modalsService.open('firstTime');
  }
}
