import {
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  OnInit
} from '@angular/core';
import { Log } from 'ng2-logger';
import { Router, ActivatedRoute } from '@angular/router';

import { RpcService } from 'app/core/rpc/rpc.service';
import { SnackbarService } from '../../core/snackbar/snackbar.service';

import { PassphraseService } from './passphrase/passphrase.service';
import { UpdaterService } from 'app/loading/updater.service';
import { take } from 'rxjs/operators';
import { isMainnetRelease } from 'app/core/util/utils';

export enum Steps {
  START = 0,
  WALLET_NAME = 1,
  ENCRYPT = 2,
  MNEMONIC_INITIAL = 3,
  MNEMONIC_VERIFY = 4,
  PASSWORD = 5,
  UNLOCK = 6,
  WAITING = 7,
  COMPLETED = 8,
}

@Component({
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss'],
  providers: [PassphraseService]
})
export class CreateWalletComponent implements OnInit {
  public log: any = Log.create('createwallet.component');

  public Steps: any = Steps; // so we can use it in HTML

  public step: number = 0;
  public stepHistory: number[] = [];

  public isCreate: boolean = false;
  public isExistingWallet: boolean = false;
  public isCrypted: boolean = false;
  public isEncrypting: boolean = false;
  public errorString: string = '';
  public isDefaultWallet: boolean = true;
  public unlock: string = ''
  public unlockVerify: string = '';

  // // wallet name
  @ViewChild('nameField')
  nameField: ElementRef;
  public walletname: string = '';

  // recovery passphrase
  public words: string[];
  private wordsVerification: string[];
  public isTestnet: boolean = !isMainnetRelease();

  // recovery password
  password: string = '';
  passwordVerify: string = '';

  // encrypt password
  encrypt: string = '';
  encryptVerify: string = '';

  constructor(
    private _passphraseService: PassphraseService,
    private _rpc: RpcService,
    private _router: Router,
    private _route: ActivatedRoute,
    private flashNotification: SnackbarService,
    private _daemon: UpdaterService
  ) {
    this.reset();
  }

  get testnet(): boolean {
    return this.isTestnet;
  }

  reset(): void {
    this.words = Array(24).fill('');
    this.step = Steps.START;
    this.stepHistory = [];
    this.isCreate = true;
    this.isEncrypting = false;
    this.unlock = '';
    this.unlockVerify = '';
    this.encrypt = '';
    this.encryptVerify = '';
  }

  ngOnInit() {
    const walletname = this._route.snapshot.queryParamMap.get('walletname');
    const encryptionstatus = this._route.snapshot.queryParamMap.get('encryptionstatus');
    this.isDefaultWallet = walletname === '';

    // if we have an encryption status getwalletinfo must have succeeded
    if (encryptionstatus) {
      this.walletname = walletname;
      this.isExistingWallet = true;
      this.isCrypted = encryptionstatus !== 'Unencrypted';
    }
  }

  initialize(type: number): void {
    this.reset();

    this.isCreate = type === 0;

    this.nextStep();
  }

  // Attempts to load the previous step.
  prevStep(): void {
    this.step = this.stepHistory.pop() || 0;
    this.errorString = '';
    this.doStep();
  }

  // Performs cleanup actions at the end of the current step, and the indicates which step to navigate to next.
  nextStep(): void {
    if (!this.validate()) {
      return;
    }

    switch (this.step) {
      case Steps.WAITING:
        break;

      case Steps.COMPLETED:
        break;

      case Steps.START:
        if (this.isExistingWallet) {
          if (this.isCrypted) {
            if (this.isCreate) {
              this.goToStep(Steps.MNEMONIC_INITIAL);
            } else {
              this.goToStep(Steps.MNEMONIC_VERIFY);
            }
          } else {
            this.goToStep(Steps.ENCRYPT);
          }
        } else {
          this.goToStep(Steps.WALLET_NAME);
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
              // Already in the create wallet flow so no need to check for create/restore
              this.goToStep(Steps.MNEMONIC_INITIAL, false);
            } else {
              this.goToStep(Steps.ENCRYPT, false);
            }
          },
          error => {
            if (error.code === -4) {
              this.errorString = `A wallet with the name ${this.walletname} already exists!`;
            } else {
              this.flashNotification.open(error, 'error');
            }

            this.log.er('Wallet Name step error: ', error);
          });
        break;

      case Steps.ENCRYPT:
        if (this.encrypt !== '') {
          // Encryption step was completed
          this.isEncrypting = true;
          this._rpc.call('encryptwallet', [this.encrypt])
            .pipe(take(1))
            .subscribe(() => {
              this._daemon.restart().then(() => {
                this.isCrypted = true;
                // Dont remember history for the encypt step, once encrypted we done here
                if (this.isCreate) {
                  this.goToStep(Steps.MNEMONIC_INITIAL, false);
                } else {
                  this.goToStep(Steps.MNEMONIC_VERIFY, false);
                }
                this.isEncrypting = false;
                this.encrypt = '';
                this.encryptVerify = '';
              });
            },
            (err) => {
              this.encrypt = '';
              this.encryptVerify = '';
              this.log.er('error encrypting wallet', err);
              this.isEncrypting = false;
              if (String(err.message).includes('running with an encrypted wallet')) {
                // Just in case dev hot-reload occurences sneak through without setting the correct encryption
                this.isCrypted = true;
                // Dont remember history for the encypt step, once encrypted we done here
                if (this.isCreate) {
                  this.goToStep(Steps.MNEMONIC_INITIAL, false);
                } else {
                  this.goToStep(Steps.MNEMONIC_VERIFY, false);
                }
                this.flashNotification.open(
                  'Wallet already (previously) encrypted. Ignoring current encryption key',
                  'warning'
                );
              } else {
                this.errorString = err.message || 'Wallet failed to encrypt properly!';
              }
            });
        } else {
          // User chose not to encrypt
          if (this.isCreate) {
            this.goToStep(Steps.MNEMONIC_INITIAL);
          } else {
            this.goToStep(Steps.MNEMONIC_VERIFY);
          }
        }
        break;

      case Steps.MNEMONIC_INITIAL:
        if (this.isCreate) {
          this.goToStep(Steps.MNEMONIC_VERIFY)
        } else {
          if (!this.encrypt && this.isCrypted) {
            this.goToStep(Steps.UNLOCK);
          } else {
            this.goToStep(Steps.WAITING);
          }
        }
        break;

      case Steps.MNEMONIC_VERIFY:
        if (this.isCreate) {
          this.goToStep(Steps.PASSWORD)
        } else {
          if (!this.encrypt && this.isCrypted) {
            this.goToStep(Steps.UNLOCK);
          } else {
            this.goToStep(Steps.WAITING);
          }
        }
        break;

      case Steps.PASSWORD:
        if (!this.encrypt && this.isCrypted) {
          this.goToStep(Steps.UNLOCK);
        } else {
          this.goToStep(Steps.WAITING);
        }
        break;

      default:
        this.goToStep(this.step + 1);
    }
  }

  private goToStep(nextStep: number, rememberHistory: boolean = true) {
    if (rememberHistory) {
      this.stepHistory.push(this.step);
    }
    this.step = nextStep;
    this.doStep();
  }

  // Does some action when entering a step.
  private doStep(): void {
    if (
      (this.password.length || this.passwordVerify.length) &&
      (this.isCreate ?
        ![Steps.UNLOCK, Steps.WAITING].includes(this.step) :
        ![Steps.MNEMONIC_VERIFY, Steps.UNLOCK, Steps.WAITING].includes(this.step)
      )
    ) {
      this.password = '';
      this.passwordVerify = '';
    }

    if ((this.unlock.length || this.unlockVerify.length) > 0 &&
      ![Steps.WAITING].includes(this.step) ) {

        this.unlock = '';
        this.unlockVerify = '';
    }

    if (!this.isExistingWallet && (this.walletname.length > 0) && [Steps.START || Steps.WALLET_NAME]) {
      this.walletname = '';
    }

    switch (this.step) {
      case Steps.START:
        this.reset();
        break;
      case Steps.WALLET_NAME:
        setTimeout(() => this.nameField.nativeElement.focus(this), 1);
        break;

      case Steps.ENCRYPT:
        this.encrypt = '';
        this.encryptVerify = '';
        break;

      case Steps.MNEMONIC_INITIAL:
        this.generateMnemonic();
        break;

      case Steps.MNEMONIC_VERIFY:
        if (this.isCreate) {
          while (
            this.words.reduce((prev, curr) => prev + +(curr === ''), 0) < 5
          ) {
            const k = Math.floor(Math.random() * 23);
            this.words[k] = '';
          }
          this.flashNotification.open(
            'Did you record your words at the previous step?',
            'warning'
          );
        }
        break;

      case Steps.WAITING:
        this.log.i('importMnemonic');
        if (this.isCrypted) {
          this._rpc.call('walletpassphrase', [this.unlock, 10, false]).subscribe(
            () => {
              this.unlock = '';
              this.unlockVerify = '';
              this.importMnemoic();
            },
            (err) => {
              this.flashNotification.open(
                err.message,
                'warning'
              );
              this.prevStep();
            }
          );
        } else {
          this.importMnemoic();
        }
        break;
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

      case Steps.MNEMONIC_INITIAL:
        if (!this.isCreate) {
          // when restoring, count must be 12, 15, 18 or 24
          const count = this.words.filter((value: string) => value).length;
          valid = this.countWords(count);
        }
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
        }
        break;

      case Steps.PASSWORD:
        if (this.isCreate) {
          valid = this.password === this.passwordVerify;
          this.errorString = !valid ? 'Passwords do not match!' : '';
        }
        break;

      case Steps.UNLOCK:
        valid = this.encrypt === this.encryptVerify;
        this.errorString = !valid ? 'Encryption passwords do not match!' : '';
        break;
    }

    return valid;
  }

  close(): void {
    // move to the wallet
    this.closeAndReturn(this.walletname);
  }

  closeAndReturnToDefault(): void {
    // move to the default wallet
    this.closeAndReturn('');
  }

  private closeAndReturn(walletName: string): void {
    this._router.navigate(['/loading'], {
      queryParams: { wallet: walletName }
    });
    this.reset();
  }

  public countWords (count: number = -1): boolean {
    const value: number = count === -1 ? this.words.filter((val: string) => val).length : count;
    if ([12, 15, 18, 24].indexOf(value) !== -1) {
      return false;
    }
    return true;
  }

  private importMnemoic(): void {
    this._passphraseService.importMnemonic(this.words, this.password).subscribe(
      () => {
        this.log.i('Mnemonic imported successfully');
        this.goToStep(Steps.COMPLETED);
      },
      error => {
        if (this.isCrypted) {
          // Need to pop an extra step off, as the last step was most likely Steps.UNLOCK, and we need to navigate 1 step further back
          this.step = this.stepHistory.pop() || 0;
        }
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

  private generateMnemonic(): void {
    this._passphraseService
          .generateMnemonic()
          .pipe(take(1))
          .subscribe(mnemonic => this.setMnemonicWords(mnemonic));
  }
}
