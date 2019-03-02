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
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { SnackbarService } from '../../core/snackbar/snackbar.service';

import { PassphraseService } from './passphrase/passphrase.service';
import { UpdaterService } from 'app/core/updater/updater.service';
import { ModalsHelperService } from 'app/modals/modals-helper.service';

export enum Steps {
  START = 0,
  WALLET_NAME = 1,
  ENCRYPT = 2,
  MNEMONIC_INITIAL = 3,
  MNEMONIC_VERIFY = 4,
  PASSWORD = 5,
  WAITING = 6,
  COMPLETED = 7,
  SETTINGS = 8,
  SUMMARY = 9
}

@Component({
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss'],
  providers: [PassphraseService]
})
export class CreateWalletComponent implements OnInit, OnDestroy {
  public log: any = Log.create('createwallet.component');

  public Steps: any = Steps; // so we can use it in HTML

  public step: number = 0;
  public stepHistory: number[] = [];

  public isCreate: boolean = false;
  public isExistingWallet: boolean = false;
  public isCrypted: boolean = false;
  public isDefaultWallet: boolean = false;
  public isEncrypting: boolean = false;
  public errorString: string = '';


  // // wallet name
  @ViewChild('nameField')
  nameField: ElementRef;
  public walletname: string = '';

  // recovery passphrase
  public words: string[];
  private wordsVerification: string[];

  // recovery password
  password: string = '';
  passwordVerify: string = '';

  // encrypt password
  encrypt: string = '';
  encryptVerify: string = '';

  constructor(
    private _passphraseService: PassphraseService,
    private _rpcState: RpcStateService,
    private _rpc: RpcService,
    private _router: Router,
    private _route: ActivatedRoute,
    private flashNotification: SnackbarService,
    private _daemon: UpdaterService,
    private _modals: ModalsHelperService
  ) {
    this.reset();
  }

  reset(): void {
    this.words = Array(24).fill('');
    this.step = Steps.START;
    this.stepHistory = [];
    this.isCreate = false;
    this.isEncrypting = false;
  }

  ngOnInit() {
    const walletname = this._route.snapshot.queryParamMap.get('walletname');
    const encryptionstatus = this._route.snapshot.queryParamMap.get('encryptionstatus');

    // if we have an encryption status getwalletinfo must have succeeded
    if (encryptionstatus) {
      this.walletname = walletname;
      this.isExistingWallet = true;
      this.isCrypted = encryptionstatus !== 'Unencrypted';
      this.isDefaultWallet = walletname === '';
    }
  }

  ngOnDestroy() {
    this._rpcState.stop();
  }

  initialize(type: number): void {
    this.reset();

    this.isCreate = type === 0;

    if (this.isCreate) {
      this._passphraseService
          .generateMnemonic()
          .take(1)
          .subscribe(mnemonic => this.setMnemonicWords(mnemonic));
    }

    this.nextStep();
  }

  prevStep(): void {
    this.step = this.stepHistory.pop() || 0;
  }

  nextStep(): void {
    if (this.isCreate) {
      this.nextCreateStep();
    } else {
      this.nextRestoreStep();
    }
  }

  nextCreateStep() {
    switch (this.step) {
      case Steps.START:
        if (this.isExistingWallet) {
          if (this.isCrypted) {
            this.setCurrentStep(Steps.MNEMONIC_INITIAL, false);
          } else {
            this.setCurrentStep(Steps.ENCRYPT, false);
          }
        } else {
          this.setCurrentStep(Steps.WALLET_NAME);
          setTimeout(() => this.nameField.nativeElement.focus(this), 1);
        }
        break;

      case Steps.WALLET_NAME:
        this._rpc.call('createwallet', [this.walletname]).subscribe(
          wallet => {
            this.log.d('createwallet: ', wallet);
            this.errorString = '';
            this._rpc.wallet = this.walletname;
            this.isExistingWallet = true;

            if (this.isCrypted) {
              this.setCurrentStep(Steps.MNEMONIC_INITIAL, false);
            } else {
              this.setCurrentStep(Steps.ENCRYPT, false);
            }
          },
          error => {
            if (error.code === -4) {
              this.errorString = `A wallet with the name ${this.walletname} already exists!`;
            } else {
              this.flashNotification.open(error, 'error');
            }

            this.log.er(error);
          });
        break;

      case Steps.ENCRYPT:
        if (this.encrypt !== '') {
          this.isEncrypting = true;
          this._rpc.call('encryptwallet', [this.encrypt])
            .take(1)
            .subscribe(() => {
              // Start the rpc state for wallet lock info
              this._rpcState.start();
              this._daemon.restart().then(() => {
                this.isCrypted = true;
                // Dont remember history for the encypt step, once encrypted we done here
                this.setCurrentStep(Steps.MNEMONIC_INITIAL, false);
              });
            },
            (err) => {
              this.errorString = 'Wallet failed to encrypt properly!';
              this.log.er('error encrypting wallet', err);
            },
            () => this.isEncrypting = false);
          } else {
            this.setCurrentStep(Steps.MNEMONIC_INITIAL);
          }
        break;

      case Steps.MNEMONIC_INITIAL:
        this.setCurrentStep(Steps.MNEMONIC_VERIFY);

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
        break;

      case Steps.MNEMONIC_VERIFY:
        this.setCurrentStep(Steps.PASSWORD);
        break;

      case Steps.PASSWORD:
        this.setCurrentStep(Steps.WAITING);
        break;

      case Steps.WAITING:
        this.log.i('importMnemonic');
        if (this.isCrypted) {
          this._modals.unlock({showStakeOnly: true},
            () => {
              this.importMnemoic();
            });
        } else {
          this.importMnemoic();
        }
        break;
    }
  }

  nextRestoreStep() {
    switch (this.step) {
      case Steps.START:
        break;

    }
  }

  setCurrentStep(nextStep: number, rememberHistory: boolean = true) {
    if (rememberHistory) {
      this.stepHistory.push(this.step);
    }
    this.step = nextStep;

    // Move along, nothing for the user to do here
    if (nextStep === Steps.WAITING) {
      this.nextStep();
    }
  }

  validate(): boolean {
    let valid = true;
    this.errorString = '';

    switch (this.step) {
      case Steps.WALLET_NAME:
        valid = !!this.walletname || this.isExistingWallet;
        break;

      case Steps.ENCRYPT:
        valid = this.encrypt === this.encryptVerify;
        this.errorString = !valid ? 'Passwords do not match!' : '';
        break;

      case Steps.MNEMONIC_VERIFY:
        if (this.isCreate) {
          // get all non-matching words
          const unmatched = this.words.filter(
            (value, index) => this.wordsVerification[index] !== value
          );
          // only valid if there are 0 unmatching words!
          valid = unmatched.length === 0;
          this.errorString = !valid ? 'You have entered an invalid Recovery Phrase' : '';
        } else {
          // when restoring, count must be 12, 15, 18 or 24
          const count = this.words.filter((value: string) => value).length;
          valid = [12, 15, 18, 24].indexOf(count) !== -1;
        }
        break;

      case Steps.PASSWORD:
        if (this.isCreate) {
          valid = this.password === this.passwordVerify;
          this.errorString = !valid ? 'Passwords do not match!' : '';
        }
        break;
    }

    return valid;
  }

  close(): void {
    // move to the wallet
    this._router.navigate(['/loading'], {
      queryParams: { wallet: this.walletname }
    });
    this.reset();
  }

  closeAndReturnToDefault(): void {
    this._router.navigate(['/loading'], {
      queryParams: { wallet: '' }
    });
    this.reset();
  }

  private importMnemoic(): void {
    this._passphraseService.importMnemonic(this.words, this.password).subscribe(
      () => {
        this.log.i('Mnemonic imported successfully');
        this.setCurrentStep(Steps.COMPLETED);
      },
      error => {
        this.prevStep();
        this.errorString = error.message;
        this.log.er('Mnemonic import failed', error);
      });
  }

  private setMnemonicWords(mnemonic: any): void {
    const words = mnemonic.mnemonic.split(' ');

    if (words.length > 1) {
      this.words = words;
    }

    this.wordsVerification = Object.assign({}, this.words);
    this.log.d(`word string: ${this.words.join(' ')}`);
  }

  // capture the enter button
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.keyCode === 13) {
      this.nextStep();
    }
  }
}
