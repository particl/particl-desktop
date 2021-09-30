import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatDialogRef, MatCheckboxChange } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { Store, Select } from '@ngxs/store';
import { WalletUTXOState } from 'app/main/store/main.state';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';

import { PublicUTXO, BlindUTXO, AnonUTXO } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';


enum TextContent {
  UNKNOWN = '<unknown>',
  UTXO_TYPE_PUBLIC = 'Public',
  UTXO_TYPE_BLIND = 'Blind',
  UTXO_TYPE_ANON = 'Anon',
}


interface UTXOListItem {
  selected: boolean;
  txid: string;
  vout: number;
  amount: number;
  label: string;
  address: string;
}

type UTXOType = 'public' | 'blind' | 'anon';


interface UTXOSelectedItem {
  txid: string;
  vout: number;
}


const compare = (a: number | string, b: number | string, isAsc: boolean) => {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
};


export interface CoinControlModalData {
  txType: UTXOType;
  selected: UTXOSelectedItem[];
}


@Component({
  selector: 'app-coin-control-modal',
  templateUrl: './coin-control-modal.component.html',
  styleUrls: ['./coin-control-modal.component.scss']
})
export class CoinControlModalComponent implements OnInit, OnDestroy {

  @Select(CoreConnectionState.isTestnet) isTestnet: Observable<boolean>;

  availableUTXOs: UTXOListItem[] = [];
  selectedCount: number = 0;
  selectedTotal: string = '0';
  readonly labelUtxoType: string;


  private destroy$: Subject<void> = new Subject();
  private utxoType: UTXOType = 'public';
  private initialSelection: UTXOSelectedItem[] = [];
  private sortParams: {active: string, direction: '' | 'asc' | 'desc'} = {
    active: '',
    direction: ''
  };


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

    if (data && (Array.isArray(data.selected))) {
      data.selected.forEach(initItem => {
        if (initItem && (Object.prototype.toString.call(initItem) === '[object Object]')) {
          if ((typeof initItem.txid === 'string') && (typeof initItem.vout === 'number')) {
            this.initialSelection.push({
              vout: initItem.vout,
              txid: initItem.txid
            });
          }
        }
      });
    }
  }


  ngOnInit() {
    let func: any;

    switch (this.utxoType) {
      case 'public': func = WalletUTXOState.utxosPublic; break;
      case 'blind': func = WalletUTXOState.utxosBlind; break;
      case 'anon': func = WalletUTXOState.utxosAnon; break;
      default: func = null;
    }

    if (!func) {
      return;
    }

    this._store.select<Array<PublicUTXO | BlindUTXO | AnonUTXO>>(func()).pipe(
      tap((utxos) => {
        const newUtxos = utxos.map(utxo => {
          const utxoListItem: UTXOListItem = {
            selected: false,
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

        if (this.availableUTXOs.length > 0) {
          this.availableUTXOs.filter(u => u.selected).forEach(u => {
            this.initialSelection.push({
              txid: u.txid,
              vout: u.vout
            });
          });
        }

        if (this.initialSelection.length > 0) {
          this.initialSelection.forEach(init => {
            const found = newUtxos.find(utxo => (init.txid === utxo.txid) && (init.vout === utxo.vout));
            if (found) {
              found.selected = true;
            }
          });

          this.initialSelection = [];
        }

        this.availableUTXOs = newUtxos.filter(newUtxo => newUtxo.address.length > 0 && newUtxo.vout > -1);
        this.sortData(this.sortParams);
        this.updateTotals();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  sortData(sort: Sort) {
    if (typeof sort.active === 'string') {
      this.sortParams.active = sort.active;
    }
    if (typeof sort.direction === 'string') {
      this.sortParams.direction = sort.direction;
    }
    if (!sort.active || sort.direction === '') {
      return;
    }

    this.availableUTXOs.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'amount': return compare(a.amount, b.amount, isAsc);
        case 'label': return compare(a.label, b.label, isAsc);
        case 'address': return compare(a.address, b.address, isAsc);
        default: return 0;
      }
    });
  }


  toggleUtxo(idx: number, checkedEvent: MatCheckboxChange): void {
    if (checkedEvent && (idx < this.availableUTXOs.length) && (idx >= 0)) {
      this.availableUTXOs[idx].selected = !!checkedEvent.checked;
      this.updateTotals();
    }
  }


  actionDeselectAll() {
    this.availableUTXOs.forEach(u => u.selected = false);
    this.updateTotals();
  }


  actionSelectAll() {
    this.availableUTXOs.forEach(u => u.selected = true);
    this.updateTotals();
  }


  actionMakeSelection(): void {
    const selection = this.availableUTXOs.filter(u => u.selected).map(u => {
      const selected: UTXOSelectedItem & { amount: number} = {
        txid: u.txid,
        vout: u.vout,
        amount: u.amount
      };
      return selected;
    });

    this._dialogRef.close(selection);
  }


  private updateTotals(): void {
    const selectedItems = this.availableUTXOs.filter(u => u.selected);
    const totalAmount = new PartoshiAmount(0);

    selectedItems.forEach(item => {
      totalAmount.add(new PartoshiAmount(+item.amount));
    });

    this.selectedCount = selectedItems.length;
    this.selectedTotal = totalAmount.particlsString();
  }

}
