import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ClipboardModule } from 'ngx-clipboard';

import { PassphraseService } from './passphrase.service';

import { Log } from 'ng2-logger';

const MAX_WORDS = 24;

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.component.html',
  styleUrls: ['./passphrase.component.scss'],
})
export class PassphraseComponent {

  Arr: Function = Array;

  focused: number = 0;
  public editable: number[] = [];

  @Input() words: string[] = Array(MAX_WORDS).fill('');

  @Input() readOnly: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() partialDisable: boolean = false;

  @Output() wordsEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Output() seedImportedSuccesfulEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();

  log: any = Log.create('passphrase.component');

  constructor (private _passphraseService: PassphraseService) { }

  checkFocus(event: KeyboardEvent, index: number) {
    if (event.key === ' ') {
      this.focused = index + 1;
    }
  }

  splitAndFill(index: number): void {
    if (this.partialDisable || this.words[index].indexOf(' ') === -1) {
      return;
    }

    const words = this.words[index].split(' ');

    words.forEach((word, i) => {
      if (i + index < MAX_WORDS) {
        this.words[i + index] = this.validateWord(word, -1) ? word : 'INVALID';
      }
    });
  }

  validateWord(word: string, index: number): boolean {
    if (index !== -1 && word === '' && this.canEdit(index)) {
      this.editable.unshift(index);
      console.log(index);
    }

    return this._passphraseService.validateWord(word);
  }

  canEdit(index: number) {
    return this.editable.indexOf(index) === -1;
  }

  sendWords(): void {
    this.wordsEmitter.emit(this.words.join(' '));
  }

  clear() {
    this.words = Array(MAX_WORDS).fill('');
  }
}
