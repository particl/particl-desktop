import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormControl, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Log } from 'ng2-logger';
import { Subject, merge } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MarketState } from './../../store/market.state';
import { ProfileService } from './../../services/profile/profile.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';


enum TextContent {
  CLIPBOARD_COPY_SUCCESS = 'Copied to clipboard...',
  LABEL_ACTION_CLOSE = 'Close',
  LABEL_ACTION_CONFIRM_GENERIC = 'Next',
  LABEL_ACTION_DISPLAY_WORDS = 'Confirm words',
  LABEL_ACTION_DISPLAY_PASSWORD = 'Confirm Password',
  ACTION_CLEAR_SUCCESS = 'Successfully removed the profile secrets',
  ACTION_CLEAR_ERROR = 'Something went wrong clearing the profile secrets. Please try again shortly...',
}

enum Steps {
  ERROR,
  LOADING,
  DISPLAY_WORDS,
  CONFIRM_WORDS,
  DISPLAY_PASSWORD,
  CONFIRM_PASSWORD,
  CLEAR,
}


function valueValidator(source: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    if (control.value !== source) {
        return { 'valueValidator': true };
    }
    return null;
  };
}


@Component({
  templateUrl: './profile-backup-modal.component.html',
  styleUrls: ['./profile-backup-modal.component.scss']
})
export class ProfileBackupModalComponent implements OnInit, OnDestroy {

  log: any = Log.create('profile-backup-modal');

  STEPS: typeof Steps = Steps;  // Template typings
  activeStep: FormControl = new FormControl(Steps.LOADING);
  secretsForm: FormGroup = new FormGroup({
    words: new FormArray([]),
    password: new FormControl(''),
  });

  private currentProfileId: number = 0;
  private destroy$: Subject<void> = new Subject();
  private actionLabel: string = TextContent.LABEL_ACTION_CLOSE;

  constructor(
    private _dialogRef: MatDialogRef<ProfileBackupModalComponent>,
    private _store: Store,
    private _profileService: ProfileService,
    private _snackbar: SnackbarService
  ) { }


  ngOnInit() {
    const currentProfile = this._store.selectSnapshot(MarketState.currentProfile);
    if (!currentProfile.hasMnemonicSaved) {
      this.activeStep.setValue(Steps.ERROR);
      return;
    }

    this.currentProfileId = currentProfile.id;

    merge(
      this._profileService.fetchActiveProfileSecrets().pipe(
        tap((secrets) => {
          if (secrets.mnemonic || secrets.password) {

            this.secretsForm.setControl('password', this.createSecretControl(secrets.password));
            this.passwordControl.updateValueAndValidity();

            const wordsList = secrets.mnemonic.split(' ');
            const wordsControl = (this.secretsForm.controls['words'] as FormArray);
            for (const word of wordsList) {
              wordsControl.push(this.createSecretControl(word));
            }

            this.activeStep.setValue(Steps.DISPLAY_WORDS);

            return;
          }
          this.activeStep.setValue(Steps.ERROR);
        }),
        takeUntil(this.destroy$)
      ),

      this.activeStep.valueChanges.pipe(
        tap(value => {
          switch (value) {
            case Steps.DISPLAY_WORDS: this.actionLabel = TextContent.LABEL_ACTION_DISPLAY_WORDS; break;
            case Steps.DISPLAY_PASSWORD: this.actionLabel = TextContent.LABEL_ACTION_DISPLAY_PASSWORD; break;
            case Steps.CONFIRM_WORDS:
            case Steps.CONFIRM_PASSWORD:
              this.actionLabel = TextContent.LABEL_ACTION_CONFIRM_GENERIC;
              break;
            default:
              this.actionLabel = TextContent.LABEL_ACTION_CLOSE;
          }
        }),
        takeUntil(this.destroy$)
      ),
    ).subscribe();
  }


  get wordsControl(): FormArray {
    return this.secretsForm.controls['words'] as FormArray;
  }

  get passwordControl(): FormControl {
    return this.secretsForm.controls['password'] as FormControl;
  }

  get actionButtonLabel(): string {
    return this.actionLabel;
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  joinedWords(): string {
    return this.wordsControl.controls.map(wc => wc.value).join(' ');
  }


  copiedToClipboard(): void {
    this._snackbar.open(TextContent.CLIPBOARD_COPY_SUCCESS);
  }


  clearProfileDetails(): void {
    if (this.activeStep.value !== Steps.CLEAR) {
      return;
    }

    this._profileService.clearSecrets(this.currentProfileId).pipe(
      tap(success => this._snackbar.open(success ? TextContent.ACTION_CLEAR_SUCCESS : TextContent.ACTION_CLEAR_ERROR)),
      tap(success => {
        if (success) {
          this._dialogRef.close();
        }
      })
    ).subscribe();
  }


  doAction(): void {
    switch (this.activeStep.value) {
      case Steps.ERROR:
      case Steps.LOADING:
      case Steps.CLEAR:
        this._dialogRef.close();
        break;
      case Steps.CONFIRM_WORDS:
        if (this.secretsForm.valid) {
          this.activeStep.setValue(this.passwordControl.value.length > 0 ? Steps.DISPLAY_PASSWORD : Steps.CLEAR);
        }
        break;
      case Steps.CONFIRM_PASSWORD:
        if (this.secretsForm.valid) {
          this.activeStep.setValue(Steps.CLEAR);
        }
        break;
      case Steps.DISPLAY_WORDS:
        this.prepareWordsConfirmation();
        this.activeStep.setValue(Steps.CONFIRM_WORDS);
        break;
      case Steps.DISPLAY_PASSWORD:
        this.preparePasswordConfirmation();
        this.activeStep.setValue(Steps.CONFIRM_PASSWORD);
        break;
      default:
        this._dialogRef.close();
    }
  }


  private createSecretControl(value: string): FormControl {
    const c = new FormControl({value, disabled: true});
    const validators: ValidatorFn[] = [];
    if (value.length) {
      validators.push(Validators.required);
    }
    validators.push(valueValidator(value));
    c.setValidators(validators);
    return c;
  }


  private prepareWordsConfirmation() {
    const count = Math.min(Math.ceil(this.wordsControl.controls.length / 5), this.wordsControl.controls.length);
    const idxs: number[] = [];
    while (idxs.length < count) {
      const foundIdx = Math.floor(Math.random() * this.wordsControl.controls.length);
      if (!idxs.includes(foundIdx)) {
        idxs.push(foundIdx);
      }
    }
    for (const idx of idxs) {
      const crtl = this.wordsControl.at(idx);
      crtl.setValue('');
      crtl.enable();
    }
  }


  private preparePasswordConfirmation() {
    this.passwordControl.setValue('');
    this.passwordControl.enable();
  }
}
