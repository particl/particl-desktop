import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { Store, Select } from '@ngxs/store';
import { WalletUTXOState } from 'app/main/store/main.state';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';

import { PublicUTXO, BlindUTXO, AnonUTXO } from 'app/main/store/main.models';


enum TextContent {
  UNKNOWN = '<unknown>',
  UTXO_TYPE_PUBLIC = 'Public',
  UTXO_TYPE_BLIND = 'Blind',
  UTXO_TYPE_ANON = 'Anon',
}


// @FIXME: source https://v8.material.angular.io/components/sort/overview
interface UTXOListItem {
  txid: string;
  vout: number;
  amount: number;
  label: string;
  address: string;
}

type UTXOType = 'public' | 'blind' | 'anon';


const compare = (a: number | string, b: number | string, isAsc: boolean) => {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
};


export interface CoinControlModalData {
  txType: UTXOType;
  selected: {address: string, txid: string, vout: number}[];
}


@Component({
  selector: 'app-coin-control-modal',
  templateUrl: './coin-control-modal.component.html',
  styleUrls: ['./coin-control-modal.component.scss']
})
export class CoinControlModalComponent implements OnInit, OnDestroy {

  @Select(CoreConnectionState.isTestnet) isTestnet: Observable<boolean>;

  availableUTXOs: UTXOListItem[] = [];
  sortedData: UTXOListItem[] = [];
  readonly labelUtxoType: string;


  private destroy$: Subject<void> = new Subject();
  private utxoType: UTXOType = 'public';


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CoinControlModalData,
    private _dialogRef: MatDialogRef<CoinControlModalComponent>,
    private _store: Store
  ) {
    if (data && (typeof data.txType === 'string')) {
      if ((['public', 'blind', 'anon'] as UTXOType[]).includes(data.txType)) {
        this.utxoType = data.txType;
      }
    }

    switch (this.utxoType) {
      case 'anon':
        this.labelUtxoType = TextContent.UTXO_TYPE_ANON;
        break;
      case 'blind':
        this.labelUtxoType = TextContent.UTXO_TYPE_BLIND;
        break;
      case 'public':
        this.labelUtxoType = TextContent.UTXO_TYPE_PUBLIC;
        break;
      default:
        this.labelUtxoType = TextContent.UNKNOWN;
    }
  }


  ngOnInit() {
    this._store.select(WalletUTXOState.getValue(this.utxoType)).pipe(
      tap((utxos) => {
        const newUtxos = utxos.map((utxo: PublicUTXO | BlindUTXO | AnonUTXO) => {
          const utxoListItem: UTXOListItem = {
            address: '',
            amount: 0,
            label: '',
            txid: '',
            vout: -1
          };

          if (typeof utxo === 'object' && (![null, undefined].includes(utxo))) {
            if (+utxo.amount > 0) {
              utxoListItem.amount = utxo.amount;
            }
            if (typeof utxo.address === 'string') {
              utxoListItem.address = utxo.address;
            }
            if (typeof utxo.label === 'string') {
              utxoListItem.label = utxo.label;
            }
            if (typeof utxo.txid === 'string') {
              utxoListItem.txid = utxo.txid;
            }
            if (+utxo.vout >= 0) {
              utxoListItem.vout = +utxo.vout;
            }
          }

          return utxoListItem;
        });

        this.availableUTXOs = newUtxos.filter(newUtxo => newUtxo.address.length > 0 && newUtxo.vout > -1);

        // TODO: remove this call (its only here temporarily)
        this.sortedData = this.availableUTXOs;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  sortData(sort: Sort) {
    const data = this.availableUTXOs.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'amount': return compare(a.amount, b.amount, isAsc);
        case 'label': return compare(a.label, b.label, isAsc);
        case 'address': return compare(a.address, b.address, isAsc);
        default: return 0;
      }
    });
  }

}
