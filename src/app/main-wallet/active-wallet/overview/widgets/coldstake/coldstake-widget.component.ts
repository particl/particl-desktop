import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Select, Store } from '@ngxs/store';
import { WalletStakingState, WalletInfoState } from 'app/main/store/main.state';
import { WalletDetailActions } from 'app/main/store/main.actions';
import { Observable, Subject, iif, defer } from 'rxjs';
import { takeUntil, concatMap, take, tap, finalize } from 'rxjs/operators';

import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { ColdstakeService } from './coldstake.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
// import { ZapColdstakingModalComponent } from './zap-coldstaking-modal/zap-coldstaking-modal.component';
import { DisableColdstakingConfirmationModalComponent } from './disable-coldstaking-confirmation-modal/disable-coldstaking-confirmation-modal.component';
// import { ColdStakeModalComponent } from './coldstake-modal/coldstake-modal.component';
import { PartoshiAmount } from 'app/core/util/utils';


enum TextContent {
  REVERT_SUCCESS_NO_TXS = 'Succesfully disabled coldstaking, no transactions needed.',
  REVERT_PARTIAL_SUCCESS = 'Disabling succeeded, but some funds may still be cold staking',
  REVERT_SUCCESS = 'Succesfully brought cold staking balance into hot wallet',
  REVERT_FAILED = 'Failed to properly disable coldstaking!',
  REVERT_DETAILS_ERROR = 'Could not fetch cold staking details'
};


@Component({
  selector: 'widget-coldstake',
  templateUrl: './coldstake-widget.component.html',
  styleUrls: ['./coldstake-widget.component.scss'],
  providers: [ColdstakeService]
})
export class ColdstakeWidgetComponent implements OnDestroy {

  @Select(WalletInfoState.getValue('walletname')) walletName: Observable<string>;
  @Select(WalletStakingState.getValue('cold_staking_enabled')) isActivated: Observable<boolean>;

  isUnlocked: boolean = false;
  isProcessing: boolean = false;
  coldStakePercent: number = 0;

  private destroy$: Subject<void> = new Subject();
  private log: any = Log.create('coldstake-widget.component');


  constructor(
    private _store: Store,
    private _unlocker: WalletEncryptionService,
    private _coldStake: ColdstakeService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog
  ) {
    this._store.select(WalletInfoState.getValue('encryptionstatus')).pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (value: string) => {
        this.isUnlocked = ['Unlocked', 'Unlocked, staking only', 'Unencrypted'].includes(value);
      }
    );

    this._store.select(WalletStakingState.getValue('percent_in_coldstakeable_script')).pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (value: number) => {
        this.coldStakePercent = value;
      }
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  zap() {
    // this._unlocker.unlock({showStakingUnlock: false }).subscribe(
    //   (success: boolean) => {
    //     if (success) {
    //       this._dialog.open(ZapColdstakingModalComponent);
    //     }
    //   }
    // );
  }


  revert() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    this._unlocker.unlock({timeout: 30}).pipe(

      finalize(() => this.isProcessing = false),
      concatMap((unlocked) => {
        return iif(() => unlocked, defer(() => this._coldStake.disableColdStaking(true)))
      })

    ).subscribe(
      (estimationResults) => {
        this.openRevertConfirmationModal(estimationResults);
      },

      (err) => {
        this.log.er('fetch revert() info failed: ', err);
        this._snackbar.open(TextContent.REVERT_DETAILS_ERROR, 'err')
      }
    );
  }


  openColdStakeModal(): void {
    // this._dialog.open(ColdStakeModalComponent, {disableClose: true});
  }


  private openRevertConfirmationModal(estimationResults: {count: number, errors: number, fee: PartoshiAmount}): void {
    const dialog = this._dialog.open(
      DisableColdstakingConfirmationModalComponent,
      {data: {txCount: estimationResults.count, errorCount: estimationResults.errors, fees: estimationResults.fee.particls()}}
    );

    dialog.componentInstance.isConfirmed.pipe(
      tap(() => this.isProcessing = true),
      take(1),
      concatMap(() => this._unlocker.unlock({timeout: 10}).pipe(
        concatMap((unlocked) => iif(() => unlocked, this._coldStake.disableColdStaking(false)))
      )),
      finalize(() => this.isProcessing = false)
    ).subscribe(
      (actualResults) => {
        // request new cold staking details
        this._store.dispatch(new WalletDetailActions.GetColdStakingInfo());

        if (estimationResults.count === 0 && actualResults.count === 0) {
          this._snackbar.open(TextContent.REVERT_SUCCESS_NO_TXS, '');
        } else if (actualResults.errors > 0) {
          this._snackbar.open(TextContent.REVERT_PARTIAL_SUCCESS, 'warn');
        } else {
          this._snackbar.open(TextContent.REVERT_SUCCESS, '');
        }
      },
      (err) => {
        this.log.er('sending failed: ', err);
        this._snackbar.open(TextContent.REVERT_FAILED, 'err');
      }
    );
    dialog.afterClosed().pipe(take(1)).subscribe(() => dialog.componentInstance.isConfirmed.unsubscribe());
  }
}
