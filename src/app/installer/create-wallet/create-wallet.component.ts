import {
  Component, Inject, forwardRef, ViewChild, ElementRef, ComponentRef, HostListener,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Log } from 'ng2-logger';

import { PassphraseComponent } from 'app/installer/create-wallet/passphrase/passphrase.component';
import { PasswordComponent } from '../../modals/shared/password/password.component';
import { IPassword } from '../../modals/shared/password/password.interface';

import { slideDown } from '../../core-ui/core.animations';

import { StateService } from '../../core/core.module';
import { SnackbarService } from '../../core/snackbar/snackbar.service';
import { PassphraseService } from 'app/installer/create-wallet/passphrase/passphrase.service';

enum Step {
  CreateOrRestore = 0,
  Name = 1,
  RecoveryPass = 2,
  RecoveryPhrase = 3,
  RecoveryPhraseVerify = 4,
  UnlockBeforeImport = 5,
  Congratulations = 6
}

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss'],
  providers: [PassphraseService]
})
export class CreateWalletComponent implements OnDestroy {

  log: any = Log.create('create-wallet.component');
  private destroyed: boolean = false;

  step: Step = Step.CreateOrRestore;
  errorString: string = '';

  // step 0: create or restore
  isRestore: boolean = false;

  // step 1: name for wallet
  name: string;
  @ViewChild('nameField') nameField: ElementRef;

  // step 2: recovery pass
  password: string = '';
  passwordVerify: string = '';

  // step 3: recovery phrase
  words: string[];

  // step 4: recovery phrase verification
  private wordsVerification: string[];

  // step 5: unlocking before importing
  walletPassword: string;
  alreadyBusyImportingWallet: boolean = false; // disable buttons when importing


  @ViewChild('passphraseComponent')
  passphraseComponent: ComponentRef<PassphraseComponent>;
  @ViewChild('passwordRestoreElement') passwordRestoreElement: PasswordComponent;
  // unimportant enum ref, for usage in ngIf in template
  s: any = Step;

  constructor(
    private _passphraseService: PassphraseService,
    private router: Router,
    private state: StateService,
    private snackbar: SnackbarService
  ) {
    this.reset();
  }

  reset(): void {
    this.words = Array(24).fill('');
    this.isRestore = false;
    this.name = '';
    this.password = '';
    this.passwordVerify = '';
    this.errorString = '';
    this.step = Step.CreateOrRestore;
  }

  initialize(type: number): void {
    this.reset();

    switch (type) {
      case 1: // Create
        break;
      case 2: // Restore
        this.isRestore = true;
        break;
    }
    this.nextStep();
  }

  nextStep(): void {
    // only allow next step if current step is valid
    if (this.validate()) {
      this.step++;
      this.errorString = '';
      this.doStep();
    }
    this.log.d(`moving to step: ${this.step}`);
  }

  prevStep(): void {
    this.step--;
    this.errorString = '';
    this.doStep();
  }

  doStep(): void {
    switch (this.step) {
      case Step.Name:
        setTimeout(() => this.nameField.nativeElement.focus(this), 1);
        break;
      case Step.RecoveryPass: // only for create
        if (this.isRestore) {
          this.step = Step.RecoveryPhraseVerify;
        }
        this.password = '';
        this.passwordVerify = '';
        break;
      case Step.RecoveryPhrase: // only on create
        this._passphraseService.generateMnemonic(this.password).subscribe(
          mnemonic => this.setMnemonicSeed(mnemonic),
          error => this.errorString = error);
        break;
      case Step.RecoveryPhraseVerify: // create & restore
        while (this.words.reduce((prev, curr) => prev + +(curr === ''), 0) < 5) {
          const k = Math.floor(Math.random() * 23);
          this.words[k] = '';
        }
        break;
      case Step.UnlockBeforeImport:
        if (!this.state.get('locked')) {
          // wallet already unlocked
          this.importMnemonicSeed();
        }
        break;
      case Step.Congratulations:
        break;
    }
  }

  // Store a copy of the mnemonic seed for verification
  private setMnemonicSeed(response: Object): void {
    const words = response['mnemonic'].split(' ');

    if (words.length > 1) {
      this.words = words;
    }
    // TODO: why?
    this.wordsVerification = Object.assign({}, this.words);
    this.log.d(`word string: ${this.words.join(' ')}`);
  }

  public importMnemonicSeed(): void {
    this.alreadyBusyImportingWallet = true;

    this._passphraseService.importMnemonic(this.words, this.password, this.walletPassword)
      .subscribe(
      success => {
        if (success === 'imported') {
          this.step = Step.Congratulations;
          this.log.i('Mnemonic imported successfully');
        }
      },
      error => {
        // this.step = 4;
        this.log.er(error);
        this.errorString = error.message;
        this.alreadyBusyImportingWallet = false;
        this.log.er('Mnemonic import failed');
      });
  }

  validate(): boolean {
    if (this.step === Step.Name) {
      return !!this.name;

    } else if (this.step === Step.RecoveryPass) {
      const isValid: boolean = (this.password === this.passwordVerify);
      this.errorString = isValid ? '' : 'Passwords do not match!';
      return isValid;

    } else if (this.step === Step.RecoveryPhraseVerify && !this.isRestore) {
      const isValid = !this.words.filter(
        (value, index) => this.wordsVerification[index] !== value).length;
      this.errorString = isValid ? '' : 'You have entered an invalid recovery phrase';
      return isValid;
    }

    return true;
  }

  /** Triggered when the password is emitted from PassphraseComponent */
  wordsFromEmitter(words: string): void {
    this.words = words.split(',');
  }

  public isValidMnemonicWordCount(): boolean {
    // get count of all the entered words
    const count = this.words.filter((value: string) => value).length;
    return ([12, 15, 18, 24].indexOf(count) !== -1);

  }

  // capture the enter button
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.keyCode === 13) {
      if (this.step === Step.UnlockBeforeImport) {
        this.importMnemonicSeed();
      } else {
        this.nextStep();
      }
    }
  }

  close(): void {
    this.reset();
    this.router.navigate(['loading']);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}

