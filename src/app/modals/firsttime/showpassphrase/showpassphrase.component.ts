import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../../modals.service';

@Component({
  selector: 'app-showpassphrase',
  templateUrl: './showpassphrase.component.html',
  styleUrls: ['./showpassphrase.component.scss']
})
export class ShowpassphraseComponent {

  private password: string;

  constructor (
    @Inject(forwardRef(() => ModalsService)) private _modalsService: ModalsService
  ) {

    this.password = this._modalsService.getData();
    console.log('transfered pass:' + this.password);
  }


  back() {
    this._modalsService.open('generate');
  }

  public next() {
    console.log('next called!');
    this._modalsService.open('finish');
  }

}
