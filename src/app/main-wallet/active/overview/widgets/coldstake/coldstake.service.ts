import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { Particl, ParticlRpcService } from 'app/networks/networks.module';
import { Observable, of, forkJoin, throwError, iif, defer } from 'rxjs';
import { catchError, map, concatMap, take, mapTo } from 'rxjs/operators';
import { AddressService } from '../../../../shared/address.service';
import {
  RpcColdStakingEnabled,
  RpcColdStakingDisabled,
  ZapStakingStrategy,
  ZapGroupDetailsType,
  ColdStakingDetails,
  SelectedInputs,
} from './coldstake.models';
import { PartoshiAmount } from 'app/core/util/utils';
import { PublicUTXO, RPCResponses } from 'app/networks/particl/particl.models';


@Injectable()
export class ColdstakeService {

  constructor(
    private _rpc: ParticlRpcService,
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


  fetchColdStakingDetails(): Observable<ColdStakingDetails> {
    return forkJoin({
      spendAddress: this._rpc.call<RPCResponses.ExtKey.Account>('extkey', ['account']).pipe(
        map((resp) => {
          if ((Object.prototype.toString.call(resp) === '[object Object]') && Array.isArray(resp.chains)) {
            const chain = resp.chains.find(
              c => (c.function === 'active_internal') && (typeof c.chain === 'string') && (c.chain.length > 0)
            );
            if (chain) {
              return chain.chain;
            }
          }
          return '';
        }),
      ),

      stakeAddress: this._rpc.call<RPCResponses.WalletSettings.ChangeAddress>('walletsettings', ['changeaddress']).pipe(
        map((resp: RpcColdStakingEnabled) => {
          if (
            (Object.prototype.toString.call(resp) === '[object Object]') &&
            (Object.prototype.toString.call(resp.changeaddress) === '[object Object]') &&
            (typeof resp.changeaddress.coldstakingaddress === 'string')
          ) {
            return resp.changeaddress.coldstakingaddress;
          }
          return '';
        })
      ),
    }).pipe(
      concatMap(csDetails => iif(
        () => csDetails.spendAddress.length > 0,

        defer(() => this._addressService.getAddressInfo(csDetails.spendAddress).pipe(
          map(addressInfo => {
            csDetails.spendAddress = addressInfo && (typeof addressInfo.ismine === 'boolean') && addressInfo.ismine ?
              csDetails.spendAddress : '';
            return csDetails;
          })
        )),

        defer(() => of(csDetails))
      ))
    );
  }


  fetchZapGroupDetails(strategy: ZapStakingStrategy): Observable<ZapGroupDetailsType> {
    return forkJoin({
      utxos: this._store.selectOnce<PublicUTXO[]>(Particl.State.Wallet.Balance.utxosPublic()).pipe(take(1)),

      groupings: iif(
        () => strategy !== ZapStakingStrategy.PRIVACY,

        defer(() => of(new Map<string, string>())),

        defer(() => this._rpc.call<RPCResponses.ListAddressGroupings>('listaddressgroupings').pipe(

          map((groupings) => {
            const addressGroups = new Map<string, string>();
            if (!Array.isArray(groupings)) {
              return addressGroups;
            }
            groupings.forEach(group => {
              if (Array.isArray(group)) {
                if (group.length >= 2) {
                  const groupName = `group_${group.length}`;
                  group.forEach(g => {
                    if (Array.isArray(g) && (typeof g[0] === 'string')) {
                      addressGroups[g[0]] = groupName;
                    }
                  });
                }
              }
            });
            return addressGroups;
          }),
        ))
      ),

    }).pipe(
      map(data => {

        const groupsMap = new Map<string, {total: PartoshiAmount, utxos: PublicUTXO[]}>();

        data.utxos
        .filter(utxo =>
          !utxo.coldstaking_address &&
          (typeof utxo.desc === 'string') &&
          utxo.desc.startsWith('pkh(') &&
          (typeof utxo.address === 'string')
        )
        .forEach(utxo => {
          const addr = data.groupings.get(utxo.address) || utxo.address;

          if (!groupsMap.has(addr)) {
            groupsMap.set(addr, {total: new PartoshiAmount(0), utxos: []});
          }
          const groupsMapItem = groupsMap.get(addr);
          groupsMapItem.total.add(new PartoshiAmount(utxo.amount));
          groupsMapItem.utxos.push(utxo);
        });

        const removableKeys: string[] = [];

        for (const key of groupsMap.keys()) {
          const val = groupsMap.get(key);
          val.utxos = val.utxos.sort((a, b) => (a['amount'] < b['amount'] ? 1 : -1));
          groupsMap.set(key, val);

          if (val.utxos.length === 0) {
            removableKeys.push(key);
          }
        }

        removableKeys.forEach(key => groupsMap.delete(key));

        return groupsMap;
      })
    );
  }


  zapSelectedPrevouts(selectedPrevouts: SelectedInputs, spendAddress: string, stakeAddress: string ): Observable<boolean> {
    return this._rpc.call<RPCResponses.SendTypeTo>('sendtypeto', [
      'part',
      'part',
      [ {
          subfee: true,
          address: spendAddress,
          stakeaddress: stakeAddress,
          amount: selectedPrevouts.value,
        } ],
      'zap',
      '',
      1,
      5,
      false,
      {inputs: selectedPrevouts.utxos}
    ]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  private setColdStakingChangeAddress(address: string): Observable<RpcColdStakingDisabled | RpcColdStakingEnabled> {
    const params = {};
    if (address && address.length) {
      params['coldstakingaddress'] = address;
    }
    return this._rpc.call<RpcColdStakingDisabled | RpcColdStakingEnabled>('walletsettings', ['changeaddress', params]);
  }


  private returnFundsToWallet(
    address: string,
    estimateOnly: boolean = true
  ): Observable<{count: number, errors: number, fee: PartoshiAmount}> {
    const utxos = this._store.selectSnapshot<PublicUTXO[]>(Particl.State.Wallet.Balance.utxosPublic());
    const actualValues: Array<{amount: number, inputs: {tx: string, n: number}}> = [];
    utxos.forEach(utxo => {
      if (!utxo.coldstaking_address || !utxo.address) {
        // skip
      } else {
        actualValues.push({amount: utxo.amount, inputs: { tx: utxo.txid, n: utxo.vout }});
      }
    });

    const sendtypeto = (utxo: {amount: number, inputs: {tx: string, n: number}}) => this._rpc.call<RPCResponses.SendTypeTo>('sendtypeto', [
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
