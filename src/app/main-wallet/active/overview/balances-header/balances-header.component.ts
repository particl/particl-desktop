
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Log } from 'ng2-logger';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Balance } from './balances.models';
import { WalletInfoState, WalletBalanceState } from 'app/main/store/main.state';
import { WalletInfoStateModel } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';


@Component({
  selector: 'balances-list',
  templateUrl: './balances-header.component.html',
  styleUrls: ['./balances-header.component.scss'],
})
export class BalancesHeaderComponent implements OnInit, OnDestroy {

  private log: any = Log.create(`balances-list.component`);
  private destroy$: Subject<void> = new Subject();

  private _balances: Balance[] = [];

  constructor(
    private _store: Store
  ) { }


  ngOnInit() {
    this.log.d('component initializing');

    const definitions = [
      { label: 'TOTAL BALANCE', type: 'total_balance', description: '', horizontal: false },
      { label: 'Public', type: 'balance', description: '', horizontal: false },
      { label: 'Blind (Private)', type: 'blind_balance', description: '', horizontal: false },
      { label: 'Anon (Private)', type: 'anon_balance', description: '', horizontal: false },
      { label: 'Spendable', type: 'actual_balance', description: 'Currently available for spending', horizontal: true },
      { label: 'Locked', type: 'locked_balance', description: 'Reserved coins unavailable for spending', horizontal: true },
      { label: 'Pending', type: 'pending_balance', description: 'Incoming unconfirmed coins', horizontal: true },
      { label: 'Staking', type: 'staked_balance', description: 'Coins currently (locked in) staking', horizontal: true }
    ];

    for (const definition of definitions) {
      this._balances.push({
        id: definition.type,
        type: definition.type,
        label: definition.label,
        description: definition.description,
        amountWhole: '0',
        amountFraction: '0',
        amountSep: '',
        amount: 0,
        isHorizontal: definition.horizontal
      });
    }

    combineLatest([
      this._store.select<WalletInfoStateModel>(WalletInfoState).pipe(
        takeUntil(this.destroy$)
      ),

      this._store.select<string>(WalletBalanceState.spendableTotal()).pipe(
        takeUntil(this.destroy$)
      ),

      this._store.select<number>(WalletBalanceState.lockedTotal()).pipe(
        takeUntil(this.destroy$)
      ),
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (result) => {
        const info = result[0];
        const spendableTotal = new PartoshiAmount(+result[1], false);
        const lockedTotal = new PartoshiAmount(+result[2], false);

        this.setStandardBalances(info);

        this.setActualBalance(spendableTotal);
        this.setLockedBalance(lockedTotal);
        this.setPendingBalance(info);
      }
    );
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  get verticalBalances(): Balance[] {
    return this._balances.filter(bal => !bal.isHorizontal);
  }

  get horizontalBalances(): Balance[] {
    return this._balances.filter(bal => bal.isHorizontal);
  }


  trackByFn(idx: number, item: Balance): string {
    return item.id;
  }


  private toPartoshiAmount(amount: number): PartoshiAmount {
    return new PartoshiAmount(amount);
  }


  private updateBalanceItem(item: Balance, amount: PartoshiAmount) {
    item.amount = amount.particls();
    item.amountWhole = amount.particlStringInteger();
    const fractionString = amount.particlStringFraction();
    item.amountSep = fractionString.length > 0 ? '.' : '';
    item.amountFraction = fractionString;
  }


  private setStandardBalances(info: WalletInfoStateModel) {
    const standardBalanceTypes = ['total_balance', 'balance', 'blind_balance', 'anon_balance', 'staked_balance'];

    for (const balanceType of standardBalanceTypes) {
      const balItem = this._balances.find((bal) => bal.type === balanceType);
      if (!balItem) {
        return;
      }

      const part = this.toPartoshiAmount(+info[balanceType]);
      this.updateBalanceItem(balItem, part);
    }
  }


  private setActualBalance(totalSpendable: PartoshiAmount) {
    const balItem = this._balances.find((bal) => bal.type === 'actual_balance');
    if (!balItem) {
      return;
    }

    this.updateBalanceItem(balItem, totalSpendable);
  }


  private setLockedBalance(lockedTotal: PartoshiAmount) {
    const balItem = this._balances.find((bal) => bal.type === 'locked_balance');
    if (!balItem) {
      return;
    }
    this.updateBalanceItem(balItem, lockedTotal);
  }


  private setPendingBalance(info: WalletInfoStateModel) {
    const balItem = this._balances.find((bal) => bal.type === 'pending_balance');
    if (!balItem) {
      return;
    }

    const total = this.toPartoshiAmount(0);
    total
      .add( this.toPartoshiAmount(+info.unconfirmed_balance) )
      .add( this.toPartoshiAmount(+info.unconfirmed_blind) )
      .add( this.toPartoshiAmount(+info.unconfirmed_anon) )
      .add( this.toPartoshiAmount(+info.immature_balance) )
      .add( this.toPartoshiAmount(+info.immature_anon_balance) );

    this.updateBalanceItem(balItem, total);
  }
}
