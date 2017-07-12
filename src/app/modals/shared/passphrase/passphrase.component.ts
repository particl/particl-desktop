import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RPCService } from '../../../core/rpc/rpc.service';

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.component.html',
  styleUrls: ['./passphrase.component.scss']
})
export class PassphraseComponent implements OnInit {

  words: string[] = Array(24).fill('');

  // Used for verification
  private wordsVerification: string[];

  @Input() generateNewSeed: boolean = false;
  @Input() recoverSeed: boolean = false;

  /*
  	generate new seed
  */
  @Input() password: string = undefined;

  stateOfPassphrase: string = 'generate'; // generate or verify

  isValid: boolean = undefined;

  @Input() readOnly: boolean = false;
  @Input() isDisabled: boolean = false;

  @Output() wordsEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() wordsVerifyEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor (private _rpc: RPCService) { }

  ngOnInit() {
    if (this.generateNewSeed) {
      this.generateNew(this.password);
      this.password = undefined;
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

  generateNew(password: string) {
    console.log('generateNew: ' + password);
    if (password === undefined || password === '') {
      this._rpc.call(this, 'mnemonic', ['new'], this.rpc_generateNew);
    } else {
      this._rpc.call(this, 'mnemonic', ['new', password], this.rpc_generateNew);
    }
  }

  rpc_generateNew(json: Object) {
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
    console.log(this.getWordString());
  }

  verifySeed() {
    if (this.stateOfPassphrase === 'generate') {
      this.stateOfPassphrase = 'verify';
      this.clear();
    } else if (this.stateOfPassphrase === 'verify') {
      if (this.checkIfEqual(this.words, this.wordsVerification)) {
      alert('success seeds match!');
      this.wordsVerifyEmitter.emit(true);
      console.log('emitted!');
      this.stateOfPassphrase = 'generate';
      this.isValid = undefined;
      } else {
        alert('seed doesnt match');
        this.isValid = false;
      }
    }
  }

  checkIfEqual(words: string[], verification: string[]) {
    let state = false;

    for (const k in words) {
      if (words[k] === verification[k]) {
        state = true;
        break;
      }
    }
    return state;
  }
/*
	This is the logic for restoring the recovery phrase!
*/

  restore(password: string) {
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
