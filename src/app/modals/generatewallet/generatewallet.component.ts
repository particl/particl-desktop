import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../modals.service';

@Component({
  selector: 'app-generatewallet',
  templateUrl: './generatewallet.component.html',
  styleUrls: ['./generatewallet.component.scss']
})
export class GeneratewalletComponent {

  name: string;
  password: string;

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
    console.log("next:" + password, this.name);
    this._modalsService.showPassphrase(password);
  }

}
