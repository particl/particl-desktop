import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CreateWalletService } from '../create-wallet.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';


enum TextContent {
  COPIED_TEXT = 'Wallet recovery phrase copied to clipboard.',
}


@Component({
  selector: 'words-list',
  templateUrl: './words-list.component.html',
  styleUrls: ['./words-list.component.scss'],
})
export class WordsListComponent implements  OnInit {

  focused: number = 0;

  @ViewChild('phrase', {static: false}) phrase: ElementRef;
  @Input() words: string[] = [];

  private _sourceWords: string[] = [];
  private wordListDump: string[] = [];
  private invalidWordIndex: number[] = [];

  constructor(
    private _createService: CreateWalletService,
    private _snackbar: SnackbarService
  ) {}


  ngOnInit() {
    this._sourceWords = JSON.parse(JSON.stringify(this.words));
    if (!this.readOnly) {
      this.fetchWordListDump();
    }
  }


  get readOnly(): boolean {
    return (this._sourceWords.length > 0) && (this._sourceWords.findIndex((word) => word.length === 0) === -1);
  }

  get isVerification(): boolean {
    return (this._sourceWords.length > 0) && !this.readOnly;
  }


  get sourceWords(): string[] {
    return this._sourceWords;
  }


  validWord(idx: number): boolean {
    return !this.invalidWordIndex.includes(idx);
  }


  checkFocus(event: KeyboardEvent, index: number): void {
    if (event.key === ' ') {
      const max = this._sourceWords.length;
      for (let ii = 0; ii < max; ++ii) {
        const n = (ii + index) % max;
        if (this._sourceWords[n] === '' || this.invalidWordIndex.includes(n)) {
          this.focused = n;
          break;
        }
      }
    }
  }


  onBlur(index: number): void {
    if (this._sourceWords[index] !== '') {
      return;
    }
    this.words[index] = this.words[index].trim();
    this.validateWord(this.words[index], index);
  }


  splitAndFill(index: number): void {
    if (this.readOnly) {
      return;
    }

    if (this.sourceWords[index] !== '') {
      return;
    }

    this.words[index] = '';

    setTimeout(() => { // Paste event is called before input (modal change)

      // split the text that is pasted into the current editable input element...
      let words = this.words[index].split(' ');

      // ... limit input to the length of the editable input range...
      const maxInputs = this.sourceWords.filter(word => word.length === 0).length;
      if (words.length > maxInputs) {
        words = words.slice(0, maxInputs);
      }

      // ... and distribute amongst subsequent editable elements
      const max = this._sourceWords.length;
      let wordIdx = 0;
      for (let ii = 0; ii < max; ++ii) {
        if (wordIdx >= words.length) {
          break;
        }
        const n = (ii + index) % max;
        if (this._sourceWords[n] === '') {
          const sourceWord = words[wordIdx].trim();
          this.words[n] = sourceWord;
          this.validateWord(sourceWord, n);
          wordIdx++;
        }
      }
    }, 1);
  }


  pasteContent() {
    this.phrase.nativeElement.focus();
    document.execCommand('Paste');
  }


  copyToClipBoard(): void {
    this._snackbar.open(TextContent.COPIED_TEXT);
  }


  trackByWordsFn(idx: number, word: string) {
    return idx;
  }


  private fetchWordListDump(): void {
    this._createService.dumpWordsList().subscribe(
      (response) => {
        this.wordListDump = response.words;
      }
    );
  }

  private validateWord(word: string, index: number): void {
    if (!this.wordListDump.includes(word)) {
      this.invalidWordIndex.push(index);
    } else {
      this.invalidWordIndex = this.invalidWordIndex.filter(idx => idx !== index);
    }
  }
}
