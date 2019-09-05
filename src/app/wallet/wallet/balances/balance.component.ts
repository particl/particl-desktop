import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcStateService } from '../../../core/core.module';

import { PartoshiAmount } from '../../../core/util/utils';
import { takeWhile, map, startWith } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';


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
  private _balanceWhole: string = '0';
  private _balanceSep: string = '';
  private _balanceFraction: string = '';
  private _balanceType: string = '';

  get balanceWhole(): string {
    return this._balanceWhole;
  }

  get balanceSep(): string {
    return this._balanceSep;
  }

  get balanceFraction(): string {
    return this._balanceFraction;
  }

  get balanceType(): string {
    return this._balanceType;
  }

  constructor(private _rpcState: RpcStateService) { }

  ngOnInit() {
    this._balanceType = this.getTypeOfBalance();

    switch (this.type) {
      case 'unspent_anon':
        this.listSpendable('listunspentanon').subscribe(
          (amount: PartoshiAmount) => {
            this.setBalance(amount);
          },
          error => this.log.error('Failed to get balance, ', error)
        );
        break;

      case 'pending_balance':
        this._rpcState.observe('getwalletinfo')
          .pipe(takeWhile(() => !this.destroyed))
          .subscribe(
            balance => {
              const tempBal = new PartoshiAmount(0);
              if (balance) {
                tempBal
                  .add( new PartoshiAmount(+balance.unconfirmed_balance * Math.pow(10, 8)) )
                  .add( new PartoshiAmount(+balance.unconfirmed_blind * Math.pow(10, 8)) )
                  .add( new PartoshiAmount(+balance.unconfirmed_anon * Math.pow(10, 8)) )
                  .add( new PartoshiAmount(+balance.immature_balance * Math.pow(10, 8)) )
                  .add( new PartoshiAmount(+balance.immature_anon_balance * Math.pow(10, 8)) )
              }
              this.setBalance(tempBal);
            },
            error => this.log.error('Failed to get balance, ', error));
        break;

      case 'actual_balance':
        combineLatest(
          this.listSpendable('listunspent'),
          this.listSpendable('listunspentblind'),
          this.listSpendable('listunspentanon')
        ).pipe(
          takeWhile(() => !this.destroyed)
        ).subscribe(
          (amounts: PartoshiAmount[]) => {
            const newBal = new PartoshiAmount(0);
            for (const amount of amounts) {
              newBal.add(amount);
            }
            this.setBalance(newBal);
          }
        );
        break;

      case 'locked_balance':
        combineLatest(
          this.walletBalance(['total_balance', 'staked_balance']),
          this.listSpendable('listunspent'),
          this.listSpendable('listunspentblind'),
          this.listSpendable('listunspentanon')
        ).pipe(
          takeWhile(() => !this.destroyed)
        ).subscribe(
          (amounts: any[]) => {
            const newBal = new PartoshiAmount(0);
            for (let ii = 0; ii < amounts.length; ++ii) {
              if (ii === 0) {
                for (let jj = 0; jj < amounts[ii].length; ++jj) {
                  if (jj === 0) {
                    newBal.add(amounts[ii][jj]);
                  } else {
                    newBal.subtract(amounts[ii][jj]);
                  }
                }
              } else {
                newBal.subtract(amounts[ii]);
              }
            }

            if (newBal.particls() !== +`${this._balanceWhole}${this.balanceSep}${this.balanceFraction}`) {
              this.setBalance(newBal);
            }
          }
        );
        break;

      default:
        this._rpcState.observe('getwalletinfo', this.type)
          .pipe(takeWhile(() => !this.destroyed))
          .subscribe(
            balance => {
              this.setBalance(new PartoshiAmount(balance * Math.pow(10, 8)));
            },
            error => this.log.error('Failed to get balance, ', error));
    }
  }

  /* UI */
  private getTypeOfBalance(): string {

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
    }

    return this.type;
  }

  private listSpendable(unspentType: string): Observable<PartoshiAmount> {
    return this._rpcState.observe(unspentType).pipe(
      takeWhile(() => !this.destroyed),
      map((utxos) => {
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
        return tempBal;
      }),
      startWith(new PartoshiAmount(0))
    );
  }

  private walletBalance(balanceType: string[]): Observable<PartoshiAmount[]> {
    const defaultStart: PartoshiAmount[] = [];
    balanceType.forEach(() => defaultStart.push(new PartoshiAmount(0)));
    return this._rpcState.observe('getwalletinfo').pipe(
      takeWhile(() => !this.destroyed),
      map((walletinfo: any) => {
        const balItems: PartoshiAmount[] = [];
        if (walletinfo) {
          for (const type of balanceType) {
            balItems.push(new PartoshiAmount(+walletinfo[type] * Math.pow(10, 8)))
          }
        }
        return balItems;
      }),
      startWith(defaultStart)
    );
  }

  private setBalance(tempBal: PartoshiAmount): void {
    this._balanceWhole = tempBal.particlStringInteger();
    this._balanceSep = tempBal.particlStringSep();
    this._balanceFraction = tempBal.particlStringFraction();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
