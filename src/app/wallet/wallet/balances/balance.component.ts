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
  @Input() horizontal: boolean = false; // one-line balance, without big numbers?

  private log: any = Log.create(`balance.component ${this.type}`);
  private destroyed: boolean = false;
  private _balance: Amount = new Amount(0);

  get balance() {
    return this._balance;
  }

  constructor(private _rpcState: RpcStateService) { }

  ngOnInit() {
    const type = this.type === 'locked_balance' ? 'balance' : this.type;

    switch (type) {
      case 'unspent_blind':
        this._rpcState.observe('listunspentblind')
          .pipe(takeWhile(() => !this.destroyed))
          .subscribe(
            txs => this.calculateUnspent(txs),
            error => this.log.error('Failed to get balance, ', error));
        break;

      default:
        this._rpcState.observe('getwalletinfo', type)
          .pipe(takeWhile(() => !this.destroyed))
          .subscribe(
            balance => this.listUnSpent(balance),
            error => this.log.error('Failed to get balance, ', error));
    }
  }

  /* UI */
  getTypeOfBalance(): string {

    switch (this.type) {
      case 'total_balance':
        return 'TOTAL BALANCE';
      case 'actual_balance':
        return 'Spendable';
      case 'balance':
        return 'Public';
      case 'anon_balance':
        return 'Anon (Private)';
      case 'blind_balance':
        return 'Blind (Private)';
      case 'staked_balance':
        return 'Staking';
      case 'locked_balance':
        return 'Locked';
      case 'unspent_blind':
        return 'Unspent Blind (Private)';
    }

    return this.type;
  }

  listUnSpent(balance: number): void {
    this._rpcState.observe('listunspent')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(unspent => {
          let tempBal = 0;
          for (let ut = 0; ut < unspent.length; ut++) {
            if ((!unspent[ut].coldstaking_address || unspent[ut].address) && unspent[ut].confirmations) {
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

  calculateUnspent(txs: Array<any>): void {
    let balance = 0;
    for (const tx of txs) {
      balance += tx.confirmations ? tx.amount : 0;
    }
    this._balance = new Amount((balance), 8);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
