import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { WalletUTXOState } from 'app/main/store/main.state';
import { Observable, of, forkJoin, throwError, iif, defer } from 'rxjs';
import { catchError, map, concatMap } from 'rxjs/operators';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { AddressService } from '../../../../shared/address.service';
import {
  RpcColdStakingEnabled,
  RpcColdStakingDisabled,
} from './coldstake.models';
import { PartoshiAmount } from 'app/core/util/utils';
import { PublicUTXO } from 'app/main/store/main.models';


@Injectable()
export class ColdstakeService {

  constructor(
    private _rpc: MainRpcService,
    private _addressService: AddressService,
    private _store: Store
  ) {}


  enableColdStaking(address: string): Observable<RpcColdStakingEnabled> {
    if (!address) {
      return throwError('No address provided');
    }

    return this.setColdStakingChangeAddress(address) as Observable<RpcColdStakingEnabled>;
  }


  disableColdStaking(estimate: boolean = true): Observable<{count: number, errors: number, fee: PartoshiAmount}> {

    const refund$ = this._addressService.getDefaultStealthAddress().pipe(
      concatMap((address: string) => {
        return this.returnFundsToWallet(address, estimate);
      })
    );

    if (estimate) {
      return refund$;
    }

    return this.setColdStakingChangeAddress('').pipe(
      concatMap((result: RpcColdStakingDisabled) => {
        return iif(() =>
          result && result.changeaddress && (result.changeaddress === 'cleared'),
          refund$,
          throwError('FAILED_CHANGEADDRESS')
        );
      }),
    );
  }


  private setColdStakingChangeAddress(address: string): Observable<RpcColdStakingDisabled | RpcColdStakingEnabled> {
    const params = {};
    if (address && address.length) {
      params['coldstakingaddress'] = address;
    }
    return this._rpc.call('walletsettings', ['changeaddress', params]);
  }


  private returnFundsToWallet(
    address: string,
    estimateOnly: boolean = true
  ): Observable<{count: number, errors: number, fee: PartoshiAmount}> {
    const utxos: PublicUTXO[] = this._store.selectSnapshot(WalletUTXOState.getValue('public'));
    const actualValues: Array<{amount: number, inputs: {tx: string, n: number}}> = [];
    utxos.forEach(utxo => {
      if (!utxo.coldstaking_address || !utxo.address) {
        // skip
      } else {
        actualValues.push({amount: utxo.amount, inputs: { tx: utxo.txid, n: utxo.vout }});
      }
    });

    const sendtypeto = (utxo: {amount: number, inputs: {tx: string, n: number}}) => this._rpc.call('sendtypeto', [
      'part',
      'part',
      [
        {
          subfee: true,
          address: address,
          amount: utxo.amount
        }
      ],
      'revert coldstaking',
      '',
      4,
      64,
      estimateOnly,
      {inputs: [utxo.inputs]}
    ]).pipe(
      catchError(() => of({error: true}))
    );

    return of(actualValues).pipe(
      concatMap((utxo) => iif(
        () => utxo.length === 0,
        defer(() => of([])),
        defer(() => forkJoin(utxo.map(sendtypeto)))
      )),
      map((results: Array<{fee?: number, error?: boolean}>) => {
        let count = 0;
        let errors = 0;
        const fee = new PartoshiAmount(0);
        results.forEach(result => {
          if (+result.fee && +result.fee > 0) {
            ++count;
            fee.add(new PartoshiAmount(+result.fee));
          }
          if (result.error) {
            ++errors;
          }
        });
        return {count, fee, errors};
      })
    );
  }
}
