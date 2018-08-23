import {
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Log } from 'ng2-logger';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { RpcService } from 'app/core/rpc/rpc.service';
import { RpcStateService } from '../../core/core.module';
import { SnackbarService } from '../../core/snackbar/snackbar.service';

import { PassphraseService } from './passphrase/passphrase.service';

export enum Steps {
  START = 0,
  WALLET_NAME = 1,
  MNEMONIC_INITIAL = 2,
  MNEMONIC_VERIFY = 3,
  PASSWORD = 4,
  WAITING = 5,
  COMPLETED = 6,
  ENCRYPT = 7,
  SETTINGS = 8,
  SUMMARY = 9
}

@Component({
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss'],
  providers: [PassphraseService, RpcService, RpcStateService]
})
export class CreateWalletComponent implements OnInit, OnDestroy {
  log: any = Log.create('createwallet.component');
  private destroyed: boolean = false;
  Steps: any = Steps; // so we can use it in HTML

  step: number = 0;
  isRestore: boolean = false;
  isCrypted: boolean = false;
  errorString: string = '';
  isExistingWallet: boolean = false;

  // wallet name
  @ViewChild('nameField')
  nameField: ElementRef;
  public name: string;
  get walletName() {
    return this.isExistingWallet ? this.name : 'wallet_' + this.name;
  }

  // recovery passphrase
  words: string[];
  private wordsVerification: string[];

  // recovery password
  password: string = ''; // also used in restore
  passwordVerify: string = '';

  constructor(
    private _passphraseService: PassphraseService,
    private rpcState: RpcStateService,
    private rpc: RpcService,
    private router: Router,
    private _route: ActivatedRoute,
    private flashNotification: SnackbarService
  ) {
    this.reset();
  }

  ngOnInit() {
    // For when an existing wallet has not been correctly initialized
    const w = this._route.snapshot.queryParamMap.get('wallet');
    if (w) {
      this.name = w;
      this.isExistingWallet = true;
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  reset(): void {
    this.words = Array(24).fill('');
    this.isRestore = false;
    this.name = '';
    this.password = '';
    this.passwordVerify = '';
    this.errorString = '';
    this.step = Steps.START;
  }

  initialize(type: number): void {
    const wName: string = this.name;
    this.reset();

    if (this.isExistingWallet) {
      this.name = wName;
    }

    switch (type) {
      case 0: // Encrypt wallet
        // this._modals.encrypt();
        return;
      case 1: // Create
        break;
      case 2: // Restore
        this.isRestore = true;
        break;
    }
    if (this.isExistingWallet) {
      // Skip the name wallet step if initializing an existing wallet
      this.step++;
      this.rpc.wallet = this.name;
    }
    this.nextStep();
  }

  nextStep(): void {
    if (this.validate()) {
      this.step++;
      this.doStep();
    } else if (this.step === Steps.MNEMONIC_VERIFY) {
      this.errorString = 'You have entered an invalid Recovery Phrase';
    }

    this.log.d(`moving to step: ${this.step}`);
  }

  prevStep(): void {
    this.step--;
    if (this.step === Steps.WALLET_NAME && this.isExistingWallet) {
      // Skip the wallet naming step if initializing an existing wallet
      this.step--;
    }
    this.errorString = '';
  }

  doStep(): void {
    switch (this.step) {
      case Steps.WALLET_NAME:
        setTimeout(() => this.nameField.nativeElement.focus(this), 1);
        break;
      case Steps.MNEMONIC_INITIAL:
        if (this.isRestore) {
          break;
        }
        this._passphraseService
          .generateMnemonic()
          .subscribe(mnemonic => this.setMnemonicWords(mnemonic));
        this.flashNotification.open(
          'Please remember to write down your Recovery Passphrase',
          'warning'
        );
        break;
      case Steps.MNEMONIC_VERIFY:
        if (this.isRestore) {
          this.step = Steps.WAITING;
          this.doStep();
        } else {
          while (
            this.words.reduce((prev, curr) => prev + +(curr === ''), 0) < 5
          ) {
            const k = Math.floor(Math.random() * 23);
            this.words[k] = '';
          }
          this.flashNotification.open(
            'Did you record your password at the previous step?',
            'warning'
          );
        }
        break;
      case Steps.PASSWORD:
        break;
      case Steps.WAITING:
        this.errorString = '';
        // TODO get rid of state service
        if (this.rpcState.get('locked')) {
          // unlock wallet
          // this.step = 6
        } else {
          // wallet already unlocked
          this.importMnemonicSeed();
        }

        break;
    }
  }

  public createWalletWithName() {
    this.rpc.call('createwallet', [this.walletName]).subscribe(
      wallet => {
        this.log.d('createwallet: ', wallet);
        this.errorString = '';
        this.rpc.wallet = this.walletName;

        this.rpcState
          .observe('getwalletinfo', 'encryptionstatus')
          .takeWhile(() => !this.destroyed)
          .subscribe(status => (this.isCrypted = status !== 'Unencrypted'));

        this.nextStep();
      },
      error => {
        if (error.code === -4) {
          this.errorString = error.message.replace('wallet_', '');
        } else {
          this.flashNotification.open(error, 'error');
        }

        this.log.er(error);
      }
    );
  }

  private setMnemonicWords(mnemonic: any): void {
    const words = mnemonic.mnemonic.split(' ');

    if (words.length > 1) {
      this.words = words;
    }

    this.wordsVerification = Object.assign({}, this.words);
    this.log.d(`word string: ${this.words.join(' ')}`);
  }

  public importMnemonicSeed(): void {
    this._passphraseService.importMnemonic(this.words, this.password).subscribe(
      success => {
        this.log.i('Mnemonic imported successfully');
        this.step = Steps.COMPLETED;
      },
      error => {
        this.step = this.isRestore ? Steps.MNEMONIC_INITIAL : Steps.PASSWORD;
        this.errorString = error.message;
        this.log.er('Mnemonic import failed', error);
      }
    );
  }

  validate(): boolean {
    if (this.step === Steps.WALLET_NAME) {
      return !!this.name;
    }
    if (this.step === Steps.MNEMONIC_VERIFY && !this.isRestore) {
      // get all non-matching words
      const unmatched = this.words.filter(
        (value, index) => this.wordsVerification[index] !== value
      );
      // only valid if there are 0 unmatching words!
      const valid = unmatched.length === 0;
      return valid;
    }
    if (this.step === Steps.MNEMONIC_INITIAL && this.isRestore) {
      // when restoring, count much be 12, 15, 18 or 24
      const count = this.words.filter((value: string) => value).length;
      const valid = [12, 15, 18, 24].indexOf(count) !== -1;
      return valid;
    } else if (this.step === Steps.PASSWORD && !this.isRestore) {
      // when creating new, passwords must match
      const valid = this.password === this.passwordVerify;
      this.errorString = !valid ? 'Passwords do not match!' : '';
      return valid;
    }
    return true;
  }

  close(): void {
    // move to the wallet
    this.router.navigate([this.walletName]);
    this.reset();
  }

  // capture the enter button
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.keyCode === 13) {
      this.nextStep();
    }
  }
}
