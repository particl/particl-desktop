import { Component, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

import { Observable, Subject } from 'rxjs';

import { Select } from '@ngxs/store';
import { Particl } from 'app/networks/networks.module';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { WalletSettingsService } from '../settings.service';
import { finalize, takeUntil, tap } from 'rxjs/operators';


enum TextContent {
  SUCCESS = 'All derived wallets created successfully',
  PARTIAL_SUCCESS = 'Errors occurred while creating some of the wallets',
  ERROR_GENERIC = 'Something went wrong! Please verify the status of the current wallet before proceeding',
  ERROR_MASTER_KEY = 'Failed: Wallet is likely already derived from another wallet',
}


@Component({
  templateUrl: './derive-wallet-modal.component.html',
  styleUrls: ['./derive-wallet-modal.component.scss'],
})
export class DeriveWalletModalComponent implements OnDestroy {

  @Select(Particl.State.Wallet.Info.getValue('walletname')) walletName: Observable<string>;


  derivedForm: FormGroup = new FormGroup({
    skipCount: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(10)]),
    labels: new FormArray([], [Validators.required])
  });

  showPartialSuccessWarning: boolean = false;

  private destroy$: Subject<void> = new Subject();


  constructor(
    private _dialog: MatDialogRef<DeriveWalletModalComponent>,
    private _settingsService: WalletSettingsService,
    private _snackbar: SnackbarService,
  ) {

    // Stupid quick hacky way to ensure that the value is always an integer
    this.derivedForm.get('skipCount').valueChanges.pipe(
      tap((val => {
        if (+val !== Math.floor(+val)) {
          this.derivedForm.get('skipCount').setValue(Math.floor(+val));
        }
      }),
      takeUntil(this.destroy$)
    )).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  labelControl(): FormArray {
    return this.derivedForm.get('labels') as FormArray;
  }


  addLabel(): void {
    this.labelControl().push(this.createLabel());
  }


  removeLabel(idx: number): void {
    this.labelControl().removeAt(idx);
  }


  doAction(): void {
    if (this.derivedForm.invalid) {
      return;
    }

    this.derivedForm.disable();
    this._dialog.disableClose = true;

    const skipCountControl = this.derivedForm.get('skipCount');
    const walletLabels: string[] = this.labelControl().controls.map(c => c.value);
    let numToSkip = +skipCountControl.value;
    numToSkip = numToSkip > 0 ? numToSkip : 0;

    this._settingsService.createdDerivedWallets(walletLabels, numToSkip).pipe(
      finalize(() => {
        this.derivedForm.enable();
        this._dialog.disableClose = false;
      })
    ).subscribe(
      (result) => {

        const successCount = result.filter(r => r).length;
        if (successCount === walletLabels.length) {
          this._snackbar.open(TextContent.SUCCESS);
          this._dialog.close();
          return;
        }

        let removedCount = 0;
        result.forEach((r, idx) => {
          if (r) {
            this.removeLabel(idx - removedCount);
            removedCount++;
          }
        });
        skipCountControl.setValue((+skipCountControl.value) + successCount, {emitEvent: false});

        this._snackbar.open(TextContent.PARTIAL_SUCCESS, 'warn');
        this.showPartialSuccessWarning = true;
      },

      (err) => {
        let errMsg = TextContent.ERROR_GENERIC;
        if (err && typeof err.message === 'string') {
          if (err.message === 'Invalid or Unknown Master Key') {
            // could be a wallet that is already derived from another one. Either way, derivation fails here
            errMsg = TextContent.ERROR_MASTER_KEY;
          }
        }
        this._snackbar.open(errMsg, 'err');
      },
    );
  }


  private createLabel(): FormControl {
    return new FormControl('', [Validators.required, Validators.minLength(3)]);
  }

}
