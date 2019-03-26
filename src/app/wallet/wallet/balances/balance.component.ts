import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcStateService } from '../../../core/core.module';

import { Amount } from '../../../core/util/utils';
import { takeWhile } from 'rxjs/operators';


@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit, OnDestroy {

  @Input() type: string; // "total_balance", "anon_balance", "balance", "staked_balance", "blind_balance"
  @Input() inSidebar: boolean = false; // located in sidebar?

  private log: any = Log.create(`balance.component ${this.type}`);
  private destroyed: boolean = false;
  private _balance: Amount = new Amount(0);

  get balance() {
    return this._balance;
  }

  constructor(private _rpcState: RpcStateService) { }

  ngOnInit() {
    const type = this.type === 'locked_balance' ? 'total_balance' : this.type;

    this._rpcState.observe('getwalletinfo', type)
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(
        balance => this.listUnSpent(balance),
        error => this.log.error('Failed to get balance, ', error));
  }

  /* UI */
  getTypeOfBalance(): string {

    switch (this.type) {
      case 'total_balance':
        return 'TOTAL BALANCE';
      case 'actual_balance':
        return 'SPENDABLE';
      case 'balance':
        return 'PUBLIC';
      case 'anon_balance':
        return 'PRIVATE';
      case 'blind_balance':
        return 'BLIND';
      case 'staked_balance':
        return 'STAKING';
      case 'locked_balance':
        return 'LOCKED';
    }

    return this.type;
  }

  listUnSpent(balance: number): void {
    this._rpcState.observe('listunspent')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(unspent => {
          let tempBal = 0;
          for (let ut = 0; ut < unspent.length; ut++) {
            if (!unspent[ut].coldstaking_address || unspent[ut].address) {
              tempBal += unspent[ut].amount;
            };
          }

          if (this.type === 'locked_balance') {
            tempBal = balance - tempBal;
          } else if (this.type !== 'actual_balance') {
            tempBal = balance;
          }
          // else tempBal == 'actual balance'.

          this._balance = new Amount((tempBal) || 0, 8)
        },
        error => this.log.error('Failed to get balance, ', error));
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
