import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Log } from 'ng2-logger';

import { RpcService } from '../../../core/core.module';

@Injectable()
export class PassphraseService {

  private log: any = Log.create('passphrase.service');

  private validWords: string[];

  constructor(private _rpc: RpcService) {
    this.dumpValidWords();
  }

  dumpValidWords() {
    this._rpc.call('mnemonic', ['dumpwords'])
      .subscribe(
      (response: any) => this.validWords = response.words,
      // TODO: Handle error appropriately
      error => {
        this.log.er('dumpValidWords: mnemonic - dumpwords: Error dumping words', error);
        this.log.d('trying dumpValidWords() again every second');
        setTimeout(this.dumpValidWords.bind(this), 1 * 1000);
      });
  }

  /*
   * Create a new recovery phrase.
  */
  generateMnemonic(success: Function, password?: string) {
    this.log.d(`password: ${password}`);
    const params = ['new', password];

    if (password === undefined || password === '') {
      params.pop();
    }
    this._rpc.call('mnemonic', params)
      .subscribe(
      response => success(response),
      error => Array(24).fill('error'));
  }

  validateWord(word: string): boolean {
    if (!this.validWords) {
      return false;
    }

    return this.validWords.indexOf(word) !== -1;
  }

  importMnemonic(words: string[], password: string, walletPassword?: string) {
    return Observable.create(observer => {

      const params = [words.join(' '), password];
      if (!password) {
        params.pop();
      }

      // encrypted wallet
      if (walletPassword !== undefined) {
        // unlock wallet
        this._rpc.call('walletpassphrase', [walletPassword, 5, false]).subscribe(
          (unlocked) => {
            observer.next('unlocked');
            // import seed
            this._rpc.call('extkeygenesisimport', params).subscribe(
              (imported) => {
                // generate default public & private address
                this.generateDefaultAddresses();
                observer.next('imported');
                observer.complete();
              },
              (failed) => {
                this.log.error(failed);
                observer.error(failed);
              }
            );
          },
          (error) => {
            this.log.error(error);
            observer.error(error);
          }
        )
        // unencrypted
      } else {
        // TODO: deduplicate
        this._rpc.call('extkeygenesisimport', params).subscribe(
          (imported) => {
            this.generateDefaultAddresses();
            observer.next('imported');
            observer.complete();
          },
          (failed) => {
            this.log.error(failed);
            observer.error(failed);
          }
        );
      }
    })
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
}
