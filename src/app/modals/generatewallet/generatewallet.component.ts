import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../modals.service';

@Component({
  selector: 'app-generatewallet',
  templateUrl: './generatewallet.component.html',
  styleUrls: ['./generatewallet.component.scss']
})
export class GeneratewalletComponent {

//  name: string;

  constructor (
    @Inject(forwardRef(() => ModalsService)) private _modalsService: ModalsService
  ) { }

  back() {
    this._modalsService.open('firstTime');
  }

  nextFromEmitter(pass: object) {
    this.next(pass['password']);
  }

  next(password: string) {
    console.log('next:' + password);
    this._modalsService.storeData(password);
    this._modalsService.open('showPassphrase');
  }

}
