import { Injectable } from '@angular/core';

import { RpcService } from '../../../core/core.module';

import { Log } from 'ng2-logger';
import { catchError, tap } from 'rxjs/operators';


@Injectable()
export class PassphraseService {

  private log: any = Log.create('passphrase.service');

  private validWords: string[];

  constructor(private _rpc: RpcService) {
    this.validateWord('initWords');
  }

  /*
   * This is the logic for creating a new recovery phrase
  */
  generateMnemonic() {
    return this._rpc.call('mnemonic', ['new'])
      .pipe(catchError(error => Array(24).fill('error')));
  }

  validateWord(word: string): boolean {
    if (!this.validWords) {
      this._rpc.call('mnemonic', ['dumpwords'])
      .subscribe(
        (response: any) => this.validWords = response.words,
        // TODO: Handle error appropriately
        error => this.log.er('validateWord: mnemonic - dumpwords: Error dumping words', error));

      return false;
    }

    return this.validWords.indexOf(word) !== -1;
  }

  importMnemonic(words: string[], password: string) {
    const params = [words.join(' '), password];
    if (!password) {
      params.pop();
    }
    return this._rpc.call('extkeygenesisimport', params).pipe(
      tap(() => this.generateDefaultAddresses()),
      tap(() => this.rescanBlockchain()));
  }

  generateDefaultAddresses() {
    /* generate balance transfer address (stealth)*/
    this._rpc.call('getnewstealthaddress', ['balance transfer']).subscribe(
      (response: any) => this.log.i('generateDefaultAddresses(): generated balance transfer address'),
      error => this.log.er('generateDefaultAddresses: getnewstealthaddress failed'));

    /* generate initial public address */
    this._rpc.call('getnewaddress', ['initial address']).subscribe(
      (response: any) => this.log.i('generateDefaultAddresses(): generated initial address'),
      error => this.log.er('generateDefaultAddresses: getnewaddress failed'));
  }

  /**
   * We need to do a scan of the blockchain with an unlocked wallet.
   * The stealth addresses are generated after the import, so they are not being looked for
   * when extkeygenesisimport does the first scan.
   *
   * Note: this will only catch transactions to the FIRST stealth address.
   * It's used a lot of balance transfers.
   */
  rescanBlockchain() {
    this._rpc.call('rescanblockchain', [0]).subscribe(
      response => this.log.i('rescanBlockchain: scanning chain for transactions to stealth address'),
      error => this.log.er('rescanBlockchain: scanning the chain failed'));
  }
}
