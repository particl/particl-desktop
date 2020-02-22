
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WalletUTXOState } from 'app/main/store/main.state';
import { WalletUTXOStateModel, PublicUTXO, BlindUTXO, AnonUTXO } from 'app/main/store/main.models';
import { Store } from '@ngxs/store';
import { PartoshiAmount } from 'app/core/util/utils';
import { ValidatedAddress } from './send.models';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';


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
