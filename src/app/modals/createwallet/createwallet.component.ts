import {
  Component, Inject, forwardRef, ViewChild, ElementRef, ComponentRef, HostListener,
  OnDestroy
} from '@angular/core';
import { Log } from 'ng2-logger';
import { MatDialogRef } from '@angular/material';

import { PasswordComponent } from '../shared/password/password.component';
import { IPassword } from '../shared/password/password.interface';

import { slideDown } from '../../core-ui/core.animations';

import { PassphraseComponent } from './passphrase/passphrase.component';
import { PassphraseService } from './passphrase/passphrase.service';

import { RpcStateService } from '../../core/core.module';
import { SnackbarService } from '../../core/snackbar/snackbar.service';
import { ModalsHelperService } from 'app/modals/modals-helper.service';

@Component({
  selector: 'modal-createwallet',
  templateUrl: './createwallet.component.html',
  styleUrls: ['./createwallet.component.scss'],
  animations: [slideDown()]
})
export class CreateWalletComponent implements OnDestroy {

  log: any = Log.create('createwallet.component');

  step: number = 0;
  isRestore: boolean = false;
  name: string;
  isCrypted: boolean = false;

  @ViewChild('nameField') nameField: ElementRef;

  password: string = '';
  passwordVerify: string = '';
  words: string[];
  toggleShowPass: boolean = false;

  @ViewChild('passphraseComponent')
    passphraseComponent: ComponentRef<PassphraseComponent>;
  @ViewChild('passwordElement') passwordElement: PasswordComponent;
  @ViewChild('passwordElementVerify') passwordElementVerify: PasswordComponent;
  @ViewChild('passwordRestoreElement') passwordRestoreElement: PasswordComponent;

  // Used for verification
  private wordsVerification: string[];
  private validating: boolean = false;
  private passcount: number = 0;

  errorString: string = '';
  private destroyed: boolean = false;

  constructor (
    @Inject(forwardRef(() => ModalsHelperService))
    private _modals: ModalsHelperService,
    private _passphraseService: PassphraseService,
    private rpcState: RpcStateService,
    private flashNotification: SnackbarService,
    private dialogRef: MatDialogRef<CreateWalletComponent>
  ) {
    this.reset();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  reset(): void {
    this.rpcState.set('modal:fullWidth:enableClose', true);
    this.words = Array(24).fill('');
    this.isRestore = false;
    this.name = '';
    this.password = '';
    this.passwordVerify = '';
    this.errorString = '';
    this.step = 0;
    this.rpcState.observe('getwalletinfo', 'encryptionstatus')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.isCrypted = status !== 'Unencrypted');
  }

  initialize(type: number): void {
    this.reset();

    switch (type) {
      case 0: // Encrypt wallet
        this.dialogRef.close();
        this._modals.encrypt();
        return;
      case 1: // Create
        break;
      case 2: // Restore
          this.isRestore = true;
        break;
    }
    this.nextStep();
  }

  nextStep(): void {
    this.validating = true;

    /* Recovery password entered */
    if (this.step === 2) {
      this.password = '';
      this.passwordVerify = '';
      this.passwordElement.sendPassword();
      this.passwordElementVerify.sendPassword();
      return;
    }

    if (this.validate()) {
      this.validating = false;
      this.step++;
      this.doStep();
    }

    this.log.d(`moving to step: ${this.step}`);
  }

  prevStep(): void {
    this.step--;
    this.errorString = '';
  }

  doStep(): void {
    switch (this.step) {
      case 1:
        setTimeout(() => this.nameField.nativeElement.focus(this), 1);
        break;
      case 2:
        if (this.isRestore) {
          this.step = 4;
        }
        this.password = '';
        this.passwordVerify = '';
        break;
      case 3:
      this.log.d('step 3 execution, password=', this.password)
        this._passphraseService.generateMnemonic(
          this.mnemonicCallback.bind(this), this.password
        );
        this.flashNotification.open(
          'Please remember to write down your Recovery Passphrase',
          'warning');
        break;
      case 4:
        while (this.words.reduce((prev, curr) => prev + +(curr === ''), 0) < 5) {
          const k = Math.floor(Math.random() * 23);
          this.words[k] = '';
        }
        this.flashNotification.open(
          'Did you write your password at the previous step?',
          'warning');
        break;
      case 5:
        this.errorString = '';
        if (this.rpcState.get('locked')) {
          // unlock wallet
          this.step = 6
        } else {
          // wallet already unlocked
          this.importMnemonicSeed();
        }

        break;
    }
    this.rpcState.set('modal:fullWidth:enableClose', (this.step === 0));
  }


  private mnemonicCallback(response: Object): void {
    const words = response['mnemonic'].split(' ');

    if (words.length > 1) {
      this.words = words;
    }

    this.wordsVerification = Object.assign({}, this.words);
    this.log.d(`word string: ${this.words.join(' ')}`);
  }

  public importMnemonicSeed(): void {
    this.rpcState.set('ui:spinner', true);
    this.step = 5;

    this._passphraseService.importMnemonic(this.words, this.password)
      .subscribe(
        success => {
          this._passphraseService.generateDefaultAddresses();
          this.step = 7;
          this.rpcState.set('ui:walletInitialized', true);
          this.rpcState.set('ui:spinner', false);
          this.log.i('Mnemonic imported successfully');

        },
        error => {
          this.step = 4;
          this.log.er(error);
          this.errorString = error.message;
          this.rpcState.set('ui:spinner', false);
          this.rpcState.set('modal:fullWidth:enableClose', true);
          this.log.er('Mnemonic import failed');
        });
  }

  validate(): boolean {
    if (this.validating && this.step === 1) {
      return !!this.name;
    }
    if (this.validating && this.step === 4 && !this.isRestore) {
      const valid = !this.words.filter(
        (value, index) => this.wordsVerification[index] !== value).length;
      this.errorString = valid ? '' : 'You have entered an invalid Recovery Phrase';
      return valid;
    }

    return true;
  }

  /**
  *  Returns how many words were entered in passphrase component.
  */
  getCountOfWordsEntered(): number {
    const count = this.words.filter((value: string) => value).length;
    this.log.d(`allWordsEntered() ${count} were entered!`);
    return count;
  }

  /**
  *  Trigger password emit from restore password component
  *  Which in turn will trigger the next step (see html)
  */
  restoreWallet(): void {
    this.passwordRestoreElement.sendPassword();
  }

  /** Triggered when the password is emitted from PasswordComponent */
  passwordFromEmitter(pass: IPassword, verify?: boolean) {
    this.passcount++;
    this[verify ? 'passwordVerify' : 'password'] = (pass.password || '');
    this.log.d(`passwordFromEmitter: ${this.password} ${verify}`);

    // Make sure we got both passwords back...
    if (this.passcount % 2 === 0) {
      this.verifyPasswords();
    }
  }

  /** Triggered when showPassword is emitted from PasswordComponent */
  showPasswordToggle(show: boolean) {
    this.toggleShowPass = show;
  }

  /** verify if passwords match */
  verifyPasswords() {
    if (!this.validating) {
      return;
    }

    if (this.password !== this.passwordVerify) {
      this.flashNotification.open('Passwords do not match!', 'warning');
    } else {
      // We should probably make this a function because it isn't reusing code??
      this.validating = false;
      this.step++;
      this.doStep();
    }
  }

  /** Triggered when the password is emitted from PassphraseComponent */
  wordsFromEmitter(words: string): void {
    this.words = words.split(',');
  }

  public countWords (count: number): boolean {
    if ([12, 15, 18, 24].indexOf(count) !== -1) {
      return false;
    }
    return true;
  }

  // capture the enter button
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.keyCode === 13) {
      if (this.step < 7) {
        this.nextStep();
      } else {
        this.dialogRef.close()
      }

    }
  }
}
