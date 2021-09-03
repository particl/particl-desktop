import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Observable, Subject, merge, iif, defer, of, throwError, EMPTY } from 'rxjs';
import { takeUntil, filter, tap, skip, concatMap, expand, delay, map, catchError, distinctUntilChanged } from 'rxjs/operators';
import { Log } from 'ng2-logger';

import { Store } from '@ngxs/store';
import { WalletInfoState } from 'app/main/store/main.state';

import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { ColdstakeService } from './../coldstake.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { PublicUTXO } from 'app/main/store/main.models';
import { ZapStakingStrategy as StakingStrategy, ZapStakingStrategy, ZapGroupDetailsType, SelectedInputs } from '../coldstake.models';


interface ZapOption {
  name: string;
  value: StakingStrategy;
  description: string;
}


enum TextContent {
  ZAP_STRATEGY_STAKING_LABEL = 'Optimized for Staking',
  ZAP_STRATEGY_STAKING_DESCRIPTION = 'Any inputs will be joined together for larger transaction outputs that are more likely to stake.',
  ZAP_STRATEGY_PRIVACY_LABEL = 'Optimized for Privacy',
  ZAP_STRATEGY_PRIVACY_DESCRIPTION = 'Only inputs already linked in the chain will be joined together.',
  INFO_LABEL = 'Up to ${inputs} inputs will be selected per transaction or until the output value is over ${amount} PART.',

  ZAP_ERROR_FAILED_TRANSACTION = 'Failed to process one or more transactions',
  ZAP_ERROR_INVALID_ADDRESS = 'Invalid stake or spend address detected',
  ZAP_ERROR_WALLET_LOCK = 'Wallet locked',
  ZAP_ERROR_GENERIC_FAILURE = 'An unexpected error occurred',
}

/*
  Could pre-generate and sign all transactions then slowly emit them.
  Issues:
   - Locktime would need to be faked or blank.
   - Updating num_derives as that can't be done while the wallet is locked.
    - Setting num_derives at tx generation is risky, if a user generates 100 txns, emits 10 and cancels,
      the stakenode lookahead won't be able to catch up to the value on the spending node.
      - Could be done from v0.19.2.14 by adding the coldstaking changeaddress as a track-only address.

  Current workaround is to unlock the wallet for 5 hours and relock when the modal closes.
*/


@Component({
  templateUrl: './zap-coldstaking-modal.component.html',
  styleUrls: ['./zap-coldstaking-modal.component.scss']
})
export class ZapColdstakingModalComponent implements OnInit, OnDestroy {

  readonly selectorOptions: ZapOption[] = [
    { name: TextContent.ZAP_STRATEGY_STAKING_LABEL, value: StakingStrategy.STAKING, description: TextContent.ZAP_STRATEGY_STAKING_DESCRIPTION },
    { name: TextContent.ZAP_STRATEGY_PRIVACY_LABEL, value: StakingStrategy.PRIVACY, description: TextContent.ZAP_STRATEGY_PRIVACY_DESCRIPTION },
  ];
  readonly labelInputsValue: string = '';
  readonly zapTxDelaySecMin: number = 0;
  readonly zapTxDelaySecMax: number = 3600;

  zapOptionsForm: FormGroup;
  processingTotalValue: number = 0;
  processingTotalCount: number = 0;
  processingCurrentValue: number = 0;
  processingCurrentCount: number = 0;
  processError: string = '';
  processingNextTxnTimestamp: number = 0;


  private destroy$: Subject<void> = new Subject();
  private stopZap$: Subject<boolean> = new Subject();
  private log: any = Log.create('zap-coldstaking-modal.component');
  private readonly zapMaxAmount: number = 1000;
  private readonly zapMaxInputs: number = 20;
  private readonly DUST_PARTOSHIS: number = 10000;


  constructor(
    private _store: Store,
    private _dialogRef: MatDialogRef<ZapColdstakingModalComponent>,
    private _coldstakeService: ColdstakeService,
    private _unlocker: WalletEncryptionService,
  ) {

    this.labelInputsValue = TextContent.INFO_LABEL.replace('${inputs}', `${this.zapMaxInputs}`).replace('${amount}', `${this.zapMaxAmount}`);

    this.zapOptionsForm = new FormGroup({
      zapStrategy: new FormControl(StakingStrategy.STAKING),
      zapTxDelay: new FormControl(30, [Validators.min(this.zapTxDelaySecMin), Validators.max(this.zapTxDelaySecMax)]),
    });
  }


  ngOnInit() {

    const walletLockListener$ = this._store.select(WalletInfoState.getValue('encryptionstatus')).pipe(
      skip(1), // skip the initial load status
      filter((status: string) => this.zapOptionsForm.disabled && (status !== 'Unlocked')), // trigger only when currently zapping and wallet 'locks'
      distinctUntilChanged(),
      tap(() => {
        this.log.d('wallet locked - terminate running zapping process');
        this.stopZap$.next();
        this.processError = TextContent.ZAP_ERROR_WALLET_LOCK;
      }),
      takeUntil(this.destroy$)
    );

    const stopZapListener$ = this.stopZap$.asObservable().pipe(
      filter(() => this.zapOptionsForm.disabled),
      tap(() => {
        this.zapOptionsForm.enable();
      }),
      concatMap((completed) => this._unlocker.lock().pipe(
        tap(() => {
          this.log.d('zap processing terminated: zap processing completed successfully?', !!completed);
          if (completed) {
            this._closeModal(true);
          }
        })
      )),
      takeUntil(this.destroy$)
    );

    merge(
      walletLockListener$,
      stopZapListener$
    ).subscribe();
  }


  ngOnDestroy() {
    this.stopZap$.next();
    this.stopZap$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  get formControlTxDelay(): AbstractControl {
    return this.zapOptionsForm.get('zapTxDelay');
  }

  get formattedSliderDuration() {
    return +this.formControlTxDelay.value < 60 ?
      `${this.formControlTxDelay.value} seconds` :
      `${Math.floor(+this.formControlTxDelay.value / 60) } min ${+this.formControlTxDelay.value % 60} seconds`;
  }


  closeModal() {
    this.log.d('user close modal request');
    if (this.zapOptionsForm.disabled) {
      return;
    }
    this._closeModal();
  }


  zap() {
    if (this.zapOptionsForm.disabled) {
      return;
    }
    this.zapOptionsForm.disable();
    this.processingTotalValue = 0;
    this.processingTotalCount = 0;
    this.processingCurrentCount = 0;
    this.processingCurrentValue = 0;
    this.processError = '';
    this.processingNextTxnTimestamp = 0;

    const selectedOption = +this.zapOptionsForm.get('zapStrategy').value;
    const selectedDelay = +this.zapOptionsForm.get('zapTxDelay').value * 1000;

    this._unlocker.unlock({timeout: 5*60*60}).pipe(
      concatMap((isUnlocked) => iif(
        () => isUnlocked,

        defer(() => this.zapAmounts(selectedOption, selectedDelay)),

        defer(() => this.stopZap$.next())
      ))
    ).subscribe();
  }


  stopZap() {
    if (!this.zapOptionsForm.disabled) {
      return;
    }
    this.stopZap$.next();
  }


  private _closeModal(success?: boolean) {
    this._dialogRef.close(success);
  }


  private selectInputs(strategy: ZapStakingStrategy, groupings: ZapGroupDetailsType): SelectedInputs {
    let runningTotal = new PartoshiAmount(0);
    let selectedUtxos: PublicUTXO[] = [];
    const maxValue = new PartoshiAmount(this.zapMaxAmount).partoshis();
    let addrs = [...groupings.keys()];

    let isSatified = false;

    for (const addr of addrs) {
      let group = groupings.get(addr);

      while (true) {
        if (group.utxos.length < 1) {
          groupings.delete(addr);
        }
        if (selectedUtxos.length >= this.zapMaxInputs || runningTotal.partoshis() >= maxValue) {
          isSatified = true;
          break;
        }
        if (group.utxos.length < 1) {
          break;
        }
        let utxo = group.utxos.pop();
        runningTotal.add(new PartoshiAmount(utxo['amount']));
        selectedUtxos.push(utxo);
      }

      if (isSatified || (strategy === ZapStakingStrategy.PRIVACY)) {
        break;
      }
    }

    const rValue: SelectedInputs = {
      utxos: selectedUtxos.map(utxo => ({tx: utxo.txid, n: utxo.vout})),
      value: runningTotal.partoshis(),
    }

    return rValue;
  }


  private zapAmounts(selectedOption: ZapStakingStrategy, selectedDelay: number): Observable<boolean> {
    this.log.i(`Zapping! Selected Strategy: ${selectedOption}  ,  Txn Delay Duration(s) Selected: ${selectedDelay}`);

    return this._coldstakeService.fetchColdStakingDetails().pipe(

      concatMap(csDetails => iif(
        () => !csDetails.spendAddress || !csDetails.stakeAddress,

        defer(() => throwError(new Error('INVALID_ADDRESS'))),

        defer(() => this._coldstakeService.fetchZapGroupDetails(selectedOption).pipe(
          // calculate totals
          tap(groupings => {
            this.log.d(`Using spend_address ${csDetails.spendAddress}, stake_address ${csDetails.stakeAddress}`);

            while (true) {
              const selected = this.selectInputs(selectedOption, groupings);
              if (selected.utxos.length < 1) {
                break;
              }
              if (selected.value < this.DUST_PARTOSHIS) {
                this.log.d('Skipping candidate inputs below dust value');
                continue;
              }
              this.processingTotalCount += selected.utxos.length;
              this.processingTotalValue = new PartoshiAmount(this.processingTotalValue).add(new PartoshiAmount(selected.value, true)).particls();
              this.processingNextTxnTimestamp = Date.now() + 1000;
              this.log.d(`Candidate outputs: ${this.processingTotalCount}, value: ${this.processingTotalValue}`);
            }
          }),

          // process individual zap transactions
          expand(() => of({}).pipe(
            concatMap(() => this._coldstakeService.fetchZapGroupDetails(selectedOption).pipe(
              map(groupings => {
                let selected: SelectedInputs;

                while (true) {
                  selected = this.selectInputs(selectedOption, groupings);
                  if (selected.utxos.length < 1) {
                    this.log.i('Txn: No valid inputs');
                    break;
                  }
                  if (selected.value < this.DUST_PARTOSHIS) {
                    this.log.d('Txn: Skipping inputs below dust value');
                    continue;
                  }
                  break;
                }

                this.log.d('Txn: found utxo selection?', !!selected);

                return selected;
              }),

              concatMap(selected => iif(
                () => selected && (selected.utxos.length > 0) && (selected.value > 0),

                // send next transaction on its way
                defer(() => {
                  this.log.i('Sending zap transaction on its way');
                  return this._coldstakeService.zapSelectedPrevouts(selected, csDetails.spendAddress, csDetails.stakeAddress).pipe(
                    tap((success) => {
                      if (success) {
                        this.processingNextTxnTimestamp = Date.now() + selectedDelay;
                        this.processingCurrentCount += selected.utxos.length;
                        this.processingCurrentValue = new PartoshiAmount(this.processingCurrentValue).add(new PartoshiAmount(selected.value, true)).particls();
                        return;
                      }
                      throwError(new Error('ERROR_FAILED_TRANSACTION'));
                    })
                  );
                }),

                // all done
                defer(() => {
                  this.log.i('Zapping complete');
                  this.stopZap$.next(true);
                })
              ))
            )),

            // delay next transaction processing
            delay( selectedDelay )
          ), 1)
        ))

      )),

      catchError((err) => {
        this.log.er(err);
        switch (true) {
          case err.message === 'ERROR_FAILED_TRANSACTION': this.processError = TextContent.ZAP_ERROR_FAILED_TRANSACTION; break;
          case err.message === 'INVALID_ADDRESS': this.processError = TextContent.ZAP_ERROR_INVALID_ADDRESS; break;
          case (err.code === -13) || (typeof err.message === 'string' && err.message.toLowerCase().includes('wallet locked')):
            this.processError = TextContent.ZAP_ERROR_WALLET_LOCK;
            break;
          default: this.processError = `${TextContent.ZAP_ERROR_GENERIC_FAILURE}: ${err.message}`; break;
        }

        this.stopZap$.next();

        return EMPTY;
      }),

      takeUntil(this.stopZap$),
    );
  }

}
