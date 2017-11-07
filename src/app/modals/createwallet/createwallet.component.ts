import { Component, Inject, forwardRef, ViewChild, ElementRef, ComponentRef, HostListener } from '@angular/core';
import { Log } from 'ng2-logger';

import { PasswordComponent } from '../shared/password/password.component';
import { IPassword } from '../shared/password/password.interface';

import { flyInOut, slideDown } from '../../core/core.animations';

import { ModalsService } from '../modals.service';
import { PassphraseComponent } from './passphrase/passphrase.component';
import { PassphraseService } from './passphrase/passphrase.service';
import { StateService } from '../../core/state/state.service';


@Component({
  selector: 'modal-createwallet',
  templateUrl: './createwallet.component.html',
  styleUrls: ['./createwallet.component.scss'],
  animations: [
    flyInOut(),
    slideDown()
  ]
})
export class CreateWalletComponent {

  log: any = Log.create('createwallet.component');

  animationState: string;

  step: number = 0;
  isRestore: boolean = false;
  name: string;
  isCrypted: boolean = false;

  @ViewChild('nameField') nameField: ElementRef;

  password: string;
  words: string[];

  @ViewChild('passphraseComponent') passphraseComponent: ComponentRef<PassphraseComponent>;
  @ViewChild('passwordElement') passwordElement: PasswordComponent;
  @ViewChild('passwordRestoreElement') passwordRestoreElement: PasswordComponent;

  // Used for verification
  private wordsVerification: string[];
  private validating: boolean = false;

  errorString: string = '';

  constructor (
    @Inject(forwardRef(() => ModalsService))
    private _modalsService: ModalsService,
    private _passphraseService: PassphraseService,
    private state: StateService
  ) {
    this.reset();
  }

  reset() {
    this._modalsService.enableClose = true;
    this.state.set('modal:fullWidth:enableClose', true);
    this.words = Array(24).fill('');
    this.isRestore = false;
    this.name = '';
    this.password = '';
    this.errorString = '';
    this.step = 0;
    this.animationState = '';
    this.state.observe('encryptionstatus').take(2)
      .subscribe(status => this.isCrypted = status !== 'Unencrypted');
  }

  initialize(type: number) {
    this.reset();

    switch (type) {
      case 0:
        this._modalsService.open('encrypt', {forceOpen: true});
        return;
      case 1: // Create
        break;
      case 2: // Restore
          this.isRestore = true;
        break;
    }
    this.nextStep();
  }

  nextStep() {
    this.validating = true;

    /* Recovery password entered */
    if (this.step === 2) {
      this.passwordElement.sendPassword();
    }

    if (this.validate()) {
      this.animationState = 'next';
      this.validating = false;
      this.step++;
      setTimeout(() => this.animationState = '', 300);
      this.doStep();
    }

    this.log.d(`moving to step: ${this.step}`);
  }

  prevStep() {
    this.animationState = 'prev';
    this.step--;
    setTimeout(() => this.animationState = '', 300);
    this.doStep();
  }

  doStep() {
    switch (this.step) {
      case 1:
        setTimeout(() => this.nameField.nativeElement.focus(this), 1);
        break;
      case 2:
        if (this.isRestore) {
          this.step = 4;
        }
        break;
      case 3:
        this._passphraseService.generateMnemonic(this.mnemonicCallback.bind(this), this.password);
        break;
      case 4:
        while (this.words.reduce((prev, curr) => prev + +(curr === ''), 0) < 5) {
          const k = Math.floor(Math.random() * 23);

          this.words[k] = '';
        }
        break;
      case 5:
        this.animationState = '';
        this.step = 4;
        this.errorString = '';
        if (this.state.get('locked')) {
          // unlock wallet
          this.step = 6
        } else {
          // wallet already unlocked
          this.importMnemonicCallback();
        }

        break;
    }
    this._modalsService.enableClose = (this.step === 0);
    this.state.set('modal:fullWidth:enableClose', (this.step === 0));
  }

  private mnemonicCallback(response: Object) {
    const words = response['mnemonic'].split(' ');

    if (words.length > 1) {
      this.words = words;
    }

    this.wordsVerification = Object.assign({}, this.words);
    this.log.d(`word string: ${this.words.join(' ')}`);
  }

  public importMnemonicCallback() {
    this.state.set('ui:spinner', true);
    this._passphraseService.importMnemonic(this.words, this.password)
      .subscribe(
        success => {
          this.animationState = 'next';
          this.step = 5;
          this.state.set('ui:walletInitialized', true);
          this.state.set('ui:spinner', false);
          this.log.i('Mnemonic imported successfully');
        },
        error => {
          this.step = 4;
          this.log.er(error);
          this.errorString = error.message;
          this._modalsService.enableClose = true;
          this.state.set('ui:spinner', false);
          this.state.set('modal:fullWidth:enableClose', true);
          this.log.er('Mnemonic import failed');
        });
  }

  validate(): boolean {
    if (this.validating && this.step === 1) {
      return !!this.name;
    }
    if (this.validating && this.step === 4 && !this.isRestore) {
      return !this.words.filter((value, index) => this.wordsVerification[index] !== value).length;
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
  restoreWallet() {
    this.passwordRestoreElement.sendPassword();
  }

  /**
  * Triggered when the password is emitted from PasswordComponent
  */
  passwordFromEmitter(pass: IPassword) {
    this.password = pass.password;
    this.log.d(`passwordFromEmitter: ${this.password}`);
  }

  /**
  * Triggered when the password is emitted from PassphraseComponent
  */
  wordsFromEmitter(words: string) {
    this.words = words.split(',');
  }

  close() {
    this.reset();
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  }

  // capture the enter button
  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: any) {
    if (event.keyCode === 13) {
      this.nextStep();
    }
  }
}
