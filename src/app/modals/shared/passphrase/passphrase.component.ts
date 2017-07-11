import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-passphrase',
  templateUrl: './passphrase.component.html',
  styleUrls: ['./passphrase.component.scss']
})
export class PassphraseComponent {

  words: string[] = Array(24).fill('');

  @Input() readOnly: any = false;
  @Output() wordsEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  forceEmit() {
  	this.wordsEmitter.emit(this.getWordString());
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

  getWordString() : string {
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


}
