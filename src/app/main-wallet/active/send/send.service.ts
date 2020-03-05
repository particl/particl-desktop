
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of, throwError, iif } from 'rxjs';
import { map, catchError, concatMap } from 'rxjs/operators';

import { WalletUTXOState } from 'app/main/store/main.state';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { AddressService } from '../../shared/address.service';
import { WalletUTXOStateModel, PublicUTXO, BlindUTXO, AnonUTXO } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';
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


  getBalances(): Observable<{part: number, blind: number, anon: number}> {
    return this._store.select(WalletUTXOState).pipe(
      map((utxos: WalletUTXOStateModel) => {
        return {
          part: this.extractUTXOSpendable(utxos['public']),
          blind: this.extractUTXOSpendable(utxos['blind']),
          anon: this.extractUTXOSpendable(utxos['anon'])
        }
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
        catchError(() => of('')),
        map((address) => {
          tx.targetAddress = address;
          return tx;
        })
      );
    } else {
      source = this._addressService.validateAddress(tx.targetAddress).pipe(
        concatMap((resp: ValidatedAddress) => {
          if ((tx.transactionType === 'send') && (tx.source === 'part') && (resp.isstealthaddress === true)) {
            tx.targetTransfer = 'anon';
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
          () => (tx.addressLabel.length <= 0) || estimateFee, of(result), labelupdate$.pipe(catchError(() => of(result)), map((r) => r))
        ))
      ))
    );
  }


  private extractUTXOSpendable(utxos: PublicUTXO[] | BlindUTXO[] | AnonUTXO[] = []): number {
    const tempBal = new PartoshiAmount(0);

    for (let ii = 0; ii < utxos.length; ++ii) {
      const utxo = utxos[ii];
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        const amount = new PartoshiAmount(utxo.amount * Math.pow(10, 8));
        tempBal.add(amount);
      };
    }

    return tempBal.particls();
  }
}
