import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { WalletUTXOState } from 'app/main/store/main.state';
import { Observable, of, forkJoin, throwError, iif } from 'rxjs';
import { catchError, map, concatMap, mergeMap } from 'rxjs/operators';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { AddressService } from 'app/main-wallet/active-wallet/shared/address.service';
import {
  ZapDetailsModel,
  RpcWalletSettingsChangeAddress,
  RpcUnspentTx,
  ZapDetailUTXOModel,
  RpcSendTypeToZap,
  RpcColdStakingEnabled,
  RpcColdStakingDisabled
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
      return throwError('No address provided')
    }

    return this.setColdStakingChangeAddress(address) as Observable<RpcColdStakingEnabled>;
  }


  disableColdStaking(estimate: boolean = true): Observable<{count: number, errors: number, fee: PartoshiAmount}> {

    const refund$ = this._addressService.getDefaultStealthAddress().pipe(
      concatMap((address: string) => {
        return this.returnFundsToWallet(address, estimate)
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


  getDerivedRangeKey(pkey: string): Observable<string> {
    return this._rpc.call('deriverangekeys', [1, 1, pkey]).pipe(
      catchError(() => of([])),
      map((response: string[]) => {
        if (response.length !== 1) {
          return '';
        }
        return response[0];
      })
    )
  }


  buildScriptHex(details: ZapDetailsModel): Observable<string> {
    return this._rpc.call('buildscript', [{
      recipe: 'ifcoinstake',
      addrstake: details.coldStakingAddress,
      addrspend: details.spendingAddress
    }]).pipe(
      catchError(() => of({})),
      map((result) => {
        if (result && (typeof result.hex === 'string') && result.hex.length > 0) {
          return result.hex;
        }
        return '';
      })
    );
  }


  zapTransaction(scriptHex: string, amount: number, utxoInputs: any[], estimateFee: boolean = true): Observable<RpcSendTypeToZap> {
    return this._rpc.call('sendtypeto',
      [
        'part',
        'part',
        [{
          subfee: true,
          address: 'script',
          amount: amount,
          script: scriptHex
        }],
        'coldstaking zap',
        '',
        4,
        32,
        estimateFee,
        {
          inputs: utxoInputs
        }
      ]
    );
  }


  getZapDetails(): Observable<ZapDetailsModel> {
    const pkey$: Observable<string> = this._rpc.call('walletsettings', ['changeaddress']).pipe(
      catchError(() => of({})),
      map((response: RpcWalletSettingsChangeAddress) => {
        if (response && response.changeaddress && response.changeaddress.coldstakingaddress) {
          return response.changeaddress.coldstakingaddress;
        }

        return '';
      }),

      concatMap((pkey: string) => {
        if (pkey.length === 0 || pkey === 'default') {
          return of('')
        }

        if (pkey.length > 43) {
          // not a pool stake address
          return this.getDerivedRangeKey(pkey);
        }
        return of(pkey);
      })
    );

    return pkey$.pipe(
      mergeMap((key) => this.getScriptDetails(key))
    );
  }


  private getScriptDetails(key: string): Observable<ZapDetailsModel> {
    if (key.length === 0) {
      return of({
        utxos: [],
        value: 0,
        coldStakingAddress: '',
        spendingAddress: ''
      });
    }

    const unspent$: Observable<ZapDetailsModel> = this._rpc.call('listunspent').pipe(
      catchError(() => of([])),
      map((unspent: RpcUnspentTx[]) => {
        const amount: PartoshiAmount = new PartoshiAmount(0);
        const utxos: ZapDetailUTXOModel[] = [];
        unspent.map(utxo => {
          if (utxo.coldstaking_address || !utxo.address) {
            // skip
          } else {
            amount.add(new PartoshiAmount(+utxo.amount * Math.pow(10, 8)));
            utxos.push({
              address: utxo.address,
              amount: +utxo.amount,
              inputs: { tx: utxo.txid, n: utxo.vout }
            });
          };
        });

        return {
          utxos,
          value: amount.particls(),
          coldStakingAddress: key,
          spendingAddress: ''
        } as ZapDetailsModel;
      })
    );

    const address$: Observable<string> = this._rpc.call('getnewaddress', ['""', 'false', 'false', 'true']).pipe(
      catchError(() => of(''))
    );

    return forkJoin({
      unspent: unspent$,
      address: address$
    }).pipe(
      map((results) => {
        results.unspent.spendingAddress = results.address;
        return results.unspent;
      })
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
      concatMap((utxo) => forkJoin(...utxo.map(sendtypeto))),
      map((results: Array<{fee?: number, error?: boolean}>) => {
        let count = 0;
        let errors = 0;
        const fee = new PartoshiAmount(0);
        results.forEach(result => {
          if (+result.fee && +result.fee > 0) {
            ++count;
            fee.add(new PartoshiAmount(+result.fee * Math.pow(10, 8)));
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
