
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of, iif, throwError } from 'rxjs';
import { map, catchError, concatMap, tap } from 'rxjs/operators';

import { WalletUTXOState } from 'app/main/store/main.state';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { WalletUTXOStateModel, PublicUTXO, BlindUTXO, AnonUTXO } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';
import { ValidatedAddress, SendTransaction, SendTypeToEstimateResponse } from './send.models';
import { CoreErrorModel } from 'app/core/core.models';


@Injectable()
export class SendService {

  constructor(
    private _store: Store,
    private _rpc: MainRpcService
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


  validateAddress(address: string): Observable<ValidatedAddress> {
    return this._rpc.call('validateaddress', [address]);
  }


  getDefaultStealthAddress(): Observable<string> {
    return this._rpc.call('liststealthaddresses', null).pipe(
      map(list => list[0]['Stealth Addresses'][0]['Address'])
    );
  }


  sendTypeTo(tx: SendTransaction, estimateFee: boolean = true): Observable<SendTypeToEstimateResponse | string> {
    return this._rpc.call('sendtypeto', tx.getSendTypeParams(estimateFee));
  }


  runTransaction(tx: SendTransaction, estimateFee: boolean = true): Observable<SendTypeToEstimateResponse | string> {
    let source: Observable<SendTransaction>;
    if (tx.transactionType === 'transfer') {
      source = this.getDefaultStealthAddress().pipe(
        catchError(() => of('')),
        map((address) => {

          tx.targetAddress = address;
          return tx;
        })
      )
    } else {
      source = this.validateAddress(tx.targetAddress).pipe(
        concatMap((resp: ValidatedAddress) => {
          if (tx.getTargetType() === 'anon' && !resp.isstealthaddress) {
            return throwError('STEALTH_ADDRESS_ERROR')
          }
          if ((tx.transactionType === 'send') && (tx.source === 'part') && (resp.isstealthaddress === true)) {
            tx.targetTransfer = 'anon';
          }
          return of(tx);
        })
      )
    }

    return source.pipe(
      concatMap((trans) => this.sendTypeTo(trans, estimateFee).pipe(
        catchError((err: CoreErrorModel) => {
          if (estimateFee && (typeof err.message === 'string') && (<string>err.message).toLowerCase().includes('insufficient funds')) {
            // try again if attempting to estimate the fee and there are insufficient funds for the fee not to be deducted
            tx.deductFeesFromTotal = true;
            return this.sendTypeTo(trans, estimateFee);
          }
          return throwError(err);
        })
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
