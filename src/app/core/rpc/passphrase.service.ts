import { Injectable } from '@angular/core';

import { RPCService } from './rpc.service';

import { Log } from 'ng2-logger';


@Injectable()
export class PassphraseService {

  private log: any = Log.create('passphrase.service');

  private validWords: string[];

  constructor(private _rpc: RPCService) {
    this.validateWord('initWords');
  }

  /*
   * This is the logic for creating a new recovery phrase
  */
  generateMnemonic(success: Function, password?: string) {
    this.log.d(`password: ${password}`);
    const params = ['new', password];

    if (password === undefined || password === '') {
      params.pop();
    }
    this._rpc.call(this, 'mnemonic', params, success, () => success(Array(24).fill('error')));
  }

  validateWord(word: string): boolean {
    if (!this.validWords) {
      this._rpc.call(
        this, 'mnemonic', ['dumpwords'],
        response => this.validWords = response.words);
      return false;
    }

    return this.validWords.indexOf(word) !== -1;
  }

  importMnemonic(words: string[], password: string, success: Function, failure: Function) {
    const params = [words.join(' '), password];
    if (!password) {
      params.pop();
    }

    this._rpc.call(this, 'extkeygenesisimport', params, success, failure);
  }

/*
	This is the logic for restoring the recovery phrase!
*/

  /*
	 The restore function is called by app-password as eventEmitter with the password object!
	 in recoverwallet.component.ts
  * /

  restore(passwordObj: Object) {
    const password = passwordObj['password'];
    if (this.isDisabled) {
      alert('Still importing the recovery phrase, please wait!');
    }
    // TODO: reset isDisabled on failure of rpc!

    const wordsString = this.getWordString();

    const params: Array<any> = this.rpc_getParams(wordsString, password);
    this._rpc.call(this, 'extkeygenesisimport', params, this.rpc_importFinished);
    this.isDisabled = true;
  }

  rpc_getParams(words: string, password: string): Array<any> {
    if (password === undefined) {
      return [words];
    } else {
      return [words, password];
    }
  }

  splitAndFill() {
    const seedArray = this.words[0].split(' ');

    if (seedArray.length > 1) {
      for (const i in seedArray) {
        if (true) { // lint error
          this.words[i] = seedArray[i];
        }
      }
    }
  }

  rpc_importFinished(JSON: Object) {
    // TODO for rpc service: needs ERROR handling!
    if (JSON['result'] === 'Success.') {
      alert('Importing the recovery phrase succeeded!');
    }
  }
*/
}
