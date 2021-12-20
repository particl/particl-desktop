
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of, throwError, iif, defer, combineLatest } from 'rxjs';
import { map, catchError, concatMap, takeUntil } from 'rxjs/operators';

import { WalletBalanceState } from 'app/main/store/main.state';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { AddressService } from '../../shared/address.service';
import { SendTransaction, SendTypeToEstimateResponse } from './send.models';
import { ValidatedAddress } from '../../shared/address.models';
import { CoreErrorModel } from 'app/core/core.models';


@Injectable()
export class SendService {

  constructor(
    private _store: Store,
    private _rpc: MainRpcService,
    private _addressService: AddressService
  ) {}


  getBalances(terminator: Observable<unknown>): Observable<{part: number, blind: number, anon: number}> {
    return combineLatest([
      this._store.select(WalletBalanceState.spendableAmountPublic()).pipe(takeUntil(terminator)),
      this._store.select(WalletBalanceState.spendableAmountBlind()).pipe(takeUntil(terminator)),
      this._store.select(WalletBalanceState.spendableAmountAnon()).pipe(takeUntil(terminator)),
    ]).pipe(
      map(balances => {
        return {
          part: +balances[0],
          blind: +balances[1],
          anon: +balances[2],
        };
      })
    );
  }


  sendTypeTo(tx: SendTransaction, estimateFee: boolean = true): Observable<SendTypeToEstimateResponse | string> {
    return this._rpc.call('sendtypeto', tx.getSendTypeParams(estimateFee));
  }


  runTransaction(tx: SendTransaction, estimateFee: boolean = true): Observable<SendTypeToEstimateResponse | string> {
    let source: Observable<SendTransaction>;
    if (tx.transactionType === 'transfer') {

      source = this._addressService.getDefaultStealthAddress().pipe(
        map((address) => {
          tx.targetAddress = address;
          return tx;
        })
      );

    } else {

      source = this._addressService.validateAddress(tx.targetAddress).pipe(
        concatMap((resp: ValidatedAddress) => {
          if (!resp.isvalid) {
            return throwError('invalid targetAddress');
          }
          if (tx.transactionType === 'send') {
            if (resp.isstealthaddress === true) {
              tx.targetTransfer = 'anon';
            } else {
              tx.targetTransfer = tx.source;
            }
          }
          return of(tx);
        })
      );

    }

    const labelupdate$ = this._addressService.updateAddressLabel(tx.targetAddress, tx.addressLabel);

    return source.pipe(
      concatMap((trans) => this.sendTypeTo(trans, estimateFee).pipe(
        catchError((err: CoreErrorModel) => {
          if (estimateFee && (typeof err.message === 'string') && (<string>err.message).toLowerCase().includes('insufficient funds')) {
            // try again if attempting to estimate the fee and there are insufficient funds for the fee not to be deducted
            tx.deductFeesFromTotal = true;
            return this.sendTypeTo(trans, estimateFee);
          }
          return throwError(err);
        }),
        // update the address label if provided AND a non-estimate request, but ignore any errors thrown (the primary activity succeeded)
        concatMap((result) => iif(
          () => (tx.addressLabel.length <= 0) || estimateFee,
          defer(() => of(result)),
          defer(() => labelupdate$.pipe(catchError(() => of(result)), map((r) => r)))
        ))
      ))
    );
  }
}
