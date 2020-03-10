import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Log } from 'ng2-logger';

import { Observable, Subject, of, fromEvent } from 'rxjs';
import { takeUntil, concatMap, catchError, take, mapTo, map, finalize, filter, tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { WalletInfoState } from 'app/main/store/main.state';
import { WalletInfoStateModel } from 'app/main/store/main.models';
import { CoreErrorModel } from 'app/core/core.models';
import { MainActions } from 'app/main/store/main.actions';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { CreateWalletService } from './create-wallet.service';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';


enum TextContent {
  DEFAULT_WALLET_NAME = 'Default Wallet',
  ERROR_GENERIC = 'An unexpected error occurred processing your last request!',
  ERROR_WALLET_NAME_INVALID = 'Invalid wallet name specified',
  ERROR_WALLET_NAME_EXISTS = 'A wallet with that name already exists!',
  ERROR_WALLET_NAME_GENERAL = 'An unexpected error occurred',
  ERROR_ENCRYPTION_MATCH = 'Encryption values do not match',
  ERROR_ENCRYPTION_PREVIOUS = 'Wallet already (previously) encrypted. Ignoring current encryption key',
  ERROR_ENCRYPTION_GENERIC = 'Wallet failed to encrypt properly!',
  MNEMONIC_BACKUP = 'Did you record your words at the previous step?',
  ERROR_MNEMONIC_INVALID_WORD = 'One or more words are invalid!',
  ERROR_PASSWORD_MATCH = 'Recovery passphrase needs to match!',
  ERROR_SETUP_FAILED = 'An error occurred while completing the final wallet setup!',
  ERROR_UNLOCK_WALLET = 'Please ensure the wallet is unlocked in order to continue',
  WARNING_FAILED_ADDRESS_GENERATION = 'Please create new wallet addresses manually',
  SETUP_PROCESSING = 'Creating your wallet & scanning for transactions'
}


enum Step {
  START = 0,
  WALLET_NAME = 1,
  ENCRYPT = 2,
  MNEMONIC_INITIAL = 3,
  MNEMONIC_VERIFY = 4,
  PASSWORD = 5,
  WAITING = 7,
  COMPLETED = 8,
}


type ActionType = 'create' | 'restore';


const CREATE_STEPS: Step[] = [
  Step.WALLET_NAME,
  Step.ENCRYPT,
  Step.MNEMONIC_INITIAL,
  Step.MNEMONIC_VERIFY,
  Step.PASSWORD,
  Step.WAITING,
  Step.COMPLETED
];
const RESTORE_STEPS: Step[] = [
  Step.WALLET_NAME,
  Step.ENCRYPT,
  Step.MNEMONIC_VERIFY,
  Step.WAITING,
  Step.COMPLETED
];


@Component({
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss'],
  providers: [CreateWalletService]
})
export class CreateWalletComponent implements OnInit, OnDestroy {

  Step: typeof Step = Step; // so we can use it in HTML

  @ViewChild('nameField', {static: false}) nameField: ElementRef;

  public tempWalletName: string;
  public errorString: string = '';
  public isBusy: boolean = false;

  // encrypt password
  encrypt: string = '';
  encryptVerify: string = '';

  // recovery passphrase
  recoveryPass: string = '';
  recoveryPassVerify: string = '';

  // mnemonic words
  words: string[] = [];

  private log: any = Log.create('create-wallet.component');
  private destroy$: Subject<void> = new Subject();
  private actionType: ActionType;
  private actionIndex: number = 0;

  private isEncrypted: boolean;
  private walletName: string;

  // mnemonic words verification
  private wordsVerification: string[] = [];

  private isSettingWalletName: boolean = false;
  @ViewChild('mainPage', {static: true}) private mainContentPage: ElementRef;

  constructor(
    private _router: Router,
    private _store: Store,
    private _createService: CreateWalletService,
    private _encryptService: WalletEncryptionService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) {
    const walletInfo = <WalletInfoStateModel>this._store.selectSnapshot(WalletInfoState);
    if (typeof walletInfo.walletname === 'string') {
      this.walletName = walletInfo.walletname;
    }
    this.reset();
  }


  ngOnInit() {
    this.log.d('component initialized');

    this._store.select(WalletInfoState).pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (info: WalletInfoStateModel) => {
        const wname = info.walletname;

        if (this.isSettingWalletName) {
          this.isSettingWalletName = false;
        } else if (this.walletName !== wname) {
          // Oh crap... the wallet has probably been changed, better reset the wallet creation process.
          this.reset();
        }
        this.walletName = wname;
        this.isEncrypted = (typeof info.encryptionstatus === 'string') && (info.encryptionstatus !== 'Unencrypted');
      }
    );

    // capture the enter button, but only for this form
    fromEvent(this.mainContentPage.nativeElement, 'keyup').pipe(
      filter((event: any) => !this.isBusy && event.keyCode === 13),
      takeUntil(this.destroy$)
    ).subscribe(
      (event) => {
        this.incrementStep();
      }
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get currentStep(): Step {
    const steps = this.getActionSteps();
    return steps.length > 0 ? steps[this.actionIndex] : Step.START;
  }

  get currentWalletName(): string {
    return typeof this.walletName !== 'string' ? '' : (this.walletName || TextContent.DEFAULT_WALLET_NAME);
  }


  get actionFlow(): ActionType {
    return this.actionType;
  }


  async selectAction(doCreate: boolean): Promise<void> {
    this.actionType = doCreate ? 'create' : 'restore';
    this.actionIndex = -1;
    this.setNextStep();
    await this.doStepInit();
  }


  incrementStep(): void {
    if (this.isBusy) {
      return;
    }
    this.isBusy = true;
    this.takeStepAction().pipe(take(1)).subscribe(
      async (success: boolean) => {
        this.isBusy = false;
        if (success) {
          this.doStepCleanup();
          this.setNextStep();
          await this.doStepInit();
        }
      },
      (err) => {
        this._snackbar.open(TextContent.ERROR_GENERIC, 'err');
        this.isBusy = false;
      }
    );
  }


  async decrementStep(): Promise<void> {
    if (this.isBusy) {
      return;
    }
    this.doStepCleanup();
    this.setPreviousStep();
    await this.doStepInit();
  }


  navigateToActiveWallet(): void {
    this._router.navigate(['/main/wallet/active/overview']);
  }


  private reset(): void {
    this.actionIndex = 0;
    this.actionType = undefined;
    this.tempWalletName = '';
    this.encrypt = '';
    this.encryptVerify = '';
    this.recoveryPass = '';
    this.recoveryPassVerify = '';
    this.words = [];
  }


  private getActionSteps(): Step[] {
    switch (this.actionFlow) {
      case 'create':
        return CREATE_STEPS;
        break;
      case 'restore':
        return RESTORE_STEPS;
        break;
      default:
        return [];
    }
  }


  private setNextStep(extraSteps: number = 0): void {

    if (extraSteps === 0) {
      this.actionIndex++;
    }

    let addExtraStep = false;

    switch (this.getActionSteps()[this.actionIndex + extraSteps]) {

      case Step.WALLET_NAME:
        addExtraStep = typeof this.walletName === 'string';
        break;

      case Step.ENCRYPT:
        addExtraStep = this.isEncrypted;
        break;
    }


    if (addExtraStep) {
      this.setNextStep(extraSteps + 1);
    } else {
      this.actionIndex += extraSteps;
    }
  }


  private setPreviousStep(extraSteps: number = 0): void {

    if (extraSteps === 0) {
      this.actionIndex--;
    }

    let dropExtraStep = false;

    switch (this.getActionSteps()[this.actionIndex - extraSteps]) {

      case Step.WALLET_NAME:
        dropExtraStep = typeof this.walletName === 'string';
        break;

      case Step.ENCRYPT:
        dropExtraStep = this.isEncrypted;
        break;

      case Step.MNEMONIC_VERIFY:
        if (this.actionFlow === 'create') {
          dropExtraStep = true; // go back to MNEMONIC_INIT step
        }
        break;
    }

    if (dropExtraStep) {
      this.setPreviousStep(extraSteps + 1);
    } else {
      this.actionIndex -= extraSteps;

      if (this.actionIndex < 0) {
        this.reset();
        return;
      }
    }
  }


  private doStepCleanup(): void {
    switch (this.currentStep) {
      case Step.WALLET_NAME:
        this.tempWalletName = '';
        break;

      case Step.ENCRYPT:
        this.encrypt = '';
        this.encryptVerify = '';
        break;

      case Step.WAITING:
        this.isBusy = false;
        break;

    }
  }


  private async doStepInit(): Promise<void> {
    this.errorString = '';

    switch (this.currentStep) {
      case Step.WALLET_NAME:
        this.tempWalletName = '';
        setTimeout(() => this.nameField.nativeElement.focus(this), 1);
        break;

      case Step.ENCRYPT:
        this.encrypt = '';
        this.encryptVerify = '';
        break;

      case Step.MNEMONIC_INITIAL:
        this.recoveryPass = '';
        this.recoveryPassVerify = '';
        this.words = [];
        this.wordsVerification = [];
        const mnemonic = await this._createService.generateMnemonic().pipe(
          take(1)
        ).toPromise();

        const wordsList = mnemonic.mnemonic.split(' ');

        if (wordsList.length > 1) {
          this.words = wordsList;
          this.wordsVerification = wordsList;
        }

        break;

      case Step.MNEMONIC_VERIFY:
        this.recoveryPass = '';
        this.recoveryPassVerify = '';

        if (this.actionFlow === 'create') {
          this.words = JSON.parse(JSON.stringify(this.wordsVerification));

          while (this.words.reduce((prev, curr) => prev + +(curr === ''), 0) < 5) {
            const k = Math.floor(Math.random() * this.wordsVerification.length);
            this.words[k] = '';
          }
          this._snackbar.open(TextContent.MNEMONIC_BACKUP, 'warn');
        } else if (this.actionFlow === 'restore') {
          this.wordsVerification = Array(24).fill('');
          this.words = JSON.parse(JSON.stringify(this.wordsVerification));
        }
        break;

      case Step.WAITING:
        this.isBusy = true;
        const address$ = this._createService.generateInitialAddressHelper().pipe(
          map((generated) => {
            if (!generated) {
              this._snackbar.open(TextContent.WARNING_FAILED_ADDRESS_GENERATION, 'warn');
            }
            return true;
          })
        );

        this._encryptService.unlock({showStakingUnlock: false, timeoutIsEditable: true, timeout: 9999}).pipe(
          take(1),
          concatMap((unlocked) => {
            if (!unlocked) {
              this._snackbar.open(TextContent.ERROR_UNLOCK_WALLET, 'warn');
              return of(false);
            }

            this._dialog.open(ProcessingModalComponent, {
              disableClose: true,
              data: { message: TextContent.SETUP_PROCESSING }
            });
            return this._createService.importExtKeyGenesis(this.words, this.recoveryPass, this.actionType === 'restore').pipe(
              finalize(() => {
                this._dialog.closeAll();
              }),
              concatMap(
                () => address$.pipe(
                  concatMap((success) => this._store.dispatch(new MainActions.RefreshWalletInfo()).pipe(mapTo(success)))
                )
              )
            );
          })
        ).subscribe(
          (success) => {
            this.isBusy = false;
            if (success) {
              this.incrementStep();
            } else {
              this.decrementStep();
            }
          },
          (err) => {
            this.isBusy = false;
            this._snackbar.open(TextContent.ERROR_SETUP_FAILED, 'err');
            this.decrementStep();
          }
        );
        break;
    }
  }


  private takeStepAction(): Observable<boolean> {
    let obs: Observable<boolean>;

    switch (this.currentStep) {

      case Step.WALLET_NAME:
        if (!this.tempWalletName) {
          break;
        }

        if (!(/^[\w][\w ]*$/.test(this.tempWalletName))) {
          this.errorString = TextContent.ERROR_WALLET_NAME_INVALID;
          break;
        }

        obs = this._createService.createWallet(this.tempWalletName).pipe(
          tap(() => this.isSettingWalletName = true),
          concatMap(() => this._store.dispatch(new MainActions.ChangeWallet(this.tempWalletName)).pipe(mapTo(true))),
          catchError((err: CoreErrorModel) => {
            if (err.code === -4) {
              this.errorString = TextContent.ERROR_WALLET_NAME_EXISTS;
            } else {
              this.errorString = TextContent.ERROR_WALLET_NAME_GENERAL + ' ' + err.message;
            }
            return of(false);
          })
        );

        break;


      case Step.ENCRYPT:
        if (this.encrypt !== this.encryptVerify) {
          this.errorString = TextContent.ERROR_ENCRYPTION_MATCH;
          break;
        }

        if (this.encrypt.length) {
          obs = this._createService.encryptWallet(this.encrypt).pipe(
            concatMap(() => this._store.dispatch(new MainActions.RefreshWalletInfo()).pipe(mapTo(true))),
            catchError((err: CoreErrorModel) => {
              if (String(err.message).includes('running with an encrypted wallet')) {
                this._snackbar.open(TextContent.ERROR_ENCRYPTION_PREVIOUS, 'warn');
                return of(true);
              }
              this.errorString = TextContent.ERROR_ENCRYPTION_GENERIC;
              return of(false);
            })
          )
        } else {
          obs = of(true);
        }
        break;


      case Step.MNEMONIC_INITIAL:
        if (!this.words.length) {
          break;
        }
        obs = of(true);
        break;


      case Step.MNEMONIC_VERIFY:
        if (this.actionFlow === 'create') {
          // only valid if there are 0 unmatching words!
          const unmatched = this.words.filter((value, index) => this.wordsVerification[index] !== value.trim());
          if ((unmatched.length !== 0) || (this.words.length !== this.wordsVerification.length)) {
            this._snackbar.open(TextContent.ERROR_MNEMONIC_INVALID_WORD, 'err');
            break;
          }
          obs = of(true);
        } else if (this.actionFlow === 'restore') {
          this.words = this.words.map(word => word.trim());
          const unmatched = this.words.filter(word => word.length > 0);
          if (unmatched.length === this.words.length) {
            obs = this._createService.dumpWordsList().pipe(
              catchError(() => of({words: []})),
              concatMap((response) => {
                const allWords = response.words;
                let valid = true;
                for (const word of this.words) {
                  if (!allWords.includes(word)) {
                    valid = false;
                    this.errorString = TextContent.ERROR_MNEMONIC_INVALID_WORD;
                    break;
                  }
                }
                return of(valid);
              })
            );
          }
        }
        break;


      case Step.PASSWORD:
        if (this.recoveryPass || this.recoveryPassVerify) {
          if (this.recoveryPass !== this.recoveryPassVerify) {
            this.errorString = TextContent.ERROR_PASSWORD_MATCH;
            break;
          }
        }
        obs = of(true);
        break;


      case Step.WAITING:
        this.recoveryPass = '';
        this.recoveryPassVerify = '';
        this.words = [];
        this.wordsVerification = [];
        obs = of(true);
        break;
    }

    if (obs === undefined) {
      obs = of(false);
    }
    return obs;
  }

}
