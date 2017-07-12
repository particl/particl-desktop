import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RPCService } from '../../../core/rpc/rpc.service';

import { Log } from 'ng2-logger';
import { Logger } from 'ng2-logger/src/logger';

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.component.html',
  styleUrls: ['./passphrase.component.scss']
})
export class PassphraseComponent implements OnInit {

  words: string[] = Array(24).fill('');

  // Used for verification
  private wordsVerification: string[];

  @Input() generateSeed: boolean = false;
  @Input() recoverSeed: boolean = false;

  /*
  	generate new seed
  */
  @Input() password: string = undefined;

  stateOfPassphrase: string = 'generate'; // generate, verify or recovery

  isValid: boolean = undefined;


  @Input() readOnly: boolean = false;
  @Input() isDisabled: boolean = false;

  @Output() wordsEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() seedImportedSuccesfulEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  log: any = Log.create('passphrase.component');

  constructor (private _rpc: RPCService) { }

  ngOnInit() {
    if (this.generateSeed) {
      this.generateNewSeed();
    }
  }

  forceEmit() {
    this.wordsEmitter.emit(this.getWordString());
  }


/*
	Generic code
*/

  getWordString(): string {
    let wordsString = '';
    for (const i in this.words) {
      if (true) { // lint error
        const word = this.words[i];
        if (word !== undefined && word !== '') {
          wordsString += ( (wordsString === '' ? '' : ' ') + word);
        }
      }
    }
    return wordsString;
  }

  clear() {
    this.words = Array(24).fill('');
  }

/*
	This is the logic for creating a new recovery phrase!
*/

  generateNewSeed() {
    console.log('generateNew: ' + this.password);
    if (this.password === undefined || this.password === '') {
      this._rpc.call(this, 'mnemonic', ['new'], this.rpc_generateNewSeed);
    } else {
      this._rpc.call(this, 'mnemonic', ['new', this.password], this.rpc_generateNewSeed);
    }
  }

  rpc_generateNewSeed(json: Object) {
    const seedArray = json['mnemonic'].split(' ');
    if (seedArray.length > 1) {
      for (const i in seedArray) {
        if (true) { // lint error
          this.words[i] = seedArray[i];
        }
      }
    }
    // this.forceEmit();
    this.wordsVerification = Object.assign({}, this.words);
    this.readOnly = false;
    this.log.d('word string: ' + this.getWordString());
  }

  verifySeed() {
    if (this.stateOfPassphrase === 'generate') {
      /*
        Currently displays generated seed, switch to verification..
        Clear 24-words!
      */
      this.stateOfPassphrase = 'verify';
      this.clear();


    } else if (this.stateOfPassphrase === 'verify') {

      if (this.checkIfEqual(this.words, this.wordsVerification)) {
      alert('success, seeds match!');
      this.log.i('verifySeed: Seed double check verication [OK]!');

      // rpc: imported the seed!
      // TODO: verify that wallet is unlocked before doing this!
      this.importNewlyGenerated();

      // reset
      this.password = undefined;
      this.stateOfPassphrase = 'generate';
      this.isValid = undefined;


      } else {
        alert('seed doesnt match');
        this.log.w('verifySeed: Failed seed double check verication [FAILED]!');

        // set error message in modal
        this.isValid = false;
      }
    }
  }

  importNewlyGenerated() {
    const wordsString = this.getWordString();
    const params: Array<any> = this.rpc_getParams(wordsString, this.password);
    this._rpc.call(this, 'extkeygenesisimport', params, this.rpc_importNewSeed_success, this.rpc_importNewSeed_failed);
  }

  rpc_importNewSeed_success(json: object) {
    if (json['result'] === 'Success.') {
      this.log.i('rpc_importNewSeed_success: Succesfully imported the newly generated seed!');
      this.seedImportedSuccesfulEmitter.emit(true);
    }
  }

  rpc_importNewSeed_failed(json: Object) {
    this.log.er('rpc_importNewSeed_failed: Failed to import the newly generated seed!');
    this.log.er('with error message: ' + json['error']['message']);
  }

  checkIfEqual(words: string[], verification: string[]) {
    let state = true;

    for (const k in words) {
      if (words[k] !== verification[k]) {
        state = false;
        break;
      }
    }
    return state;
  }
/*
	This is the logic for restoring the recovery phrase!
*/

  /*
	 The restore function is called by app-password as eventEmitter with the password object!
	 in recoverwallet.component.ts
  */

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

}
