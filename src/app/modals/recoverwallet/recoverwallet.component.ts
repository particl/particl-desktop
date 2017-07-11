import { Component, Inject, forwardRef } from '@angular/core';

import { ModalsService } from '../modals.service';

import { RPCService } from '../../core/rpc/rpc.service';

@Component({
  selector: 'app-recoverwallet',
  templateUrl: './recoverwallet.component.html',
  styleUrls: ['./recoverwallet.component.scss']
})
export class RecoverwalletComponent {

  words: string[] = Array(24).fill('');
  isDisabled: boolean = false;

  constructor (
    private _rpc: RPCService,
    @Inject(forwardRef(() => ModalsService)) private _modalsService: ModalsService

  ) { }

  restore(passwordObj: Object) {
    const password = passwordObj['password'];
    if (this.isDisabled) {
      alert('Still importing the recovery phrase, please wait!');
    }
    // TODO: reset isDisabled on failure of rpc!

    let wordsString = '';
    for (const i in this.words) {
      if (true) { // lint error
        const word = this.words[i];
        if (word !== undefined && word !== '') {
          wordsString += ( (wordsString === '' ? '' : ' ') + word);
        }
      }
    }
    const params: Array<any> = this.getParams(wordsString, password);
    this._rpc.call(this, 'extkeygenesisimport', params, this.rpc_importFinished);
    this.isDisabled = true;
  }

  getParams(words: string, password: string): Array<any> {
    if (password === undefined) {
      return [words];
    } else {
      return [words, password];
    }
  }



  rpc_importFinished(JSON: Object) {
    // TODO for rpc service: needs ERROR handling!
    if (JSON['result'] === 'Success.') {
      alert('Importing the recovery phrase succeeded!');
    }
  }

  clear() {
    this.words = Array(24).fill('');
  }

  back() {
    this._modalsService.open('firstTime');
  }
}
