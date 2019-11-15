import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RpcStateService } from 'app/core/core.module';
import { takeWhile, map, startWith } from 'rxjs/operators';
import { PartoshiAmount } from 'app/core/util/utils';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BotService } from 'app/core/bot/bot.service';

export interface InsufficientFundsData {
  required: PartoshiAmount
}

@Component({
  selector: 'app-insufficient-funds',
  templateUrl: './insufficient-funds.component.html',
  styleUrls: ['./insufficient-funds.component.scss']
})
export class InsufficientFundsComponent implements OnInit, OnDestroy {

  private destroyed: boolean = false;
  public availableBalance: PartoshiAmount = new PartoshiAmount(0);
  public pendingBalance: PartoshiAmount = new PartoshiAmount(0);
  public total: PartoshiAmount = new PartoshiAmount(0);

  public hasEnoughPublic: boolean = false;
  public hasExchangeBot: boolean = false;

  constructor(
    private _rpcState: RpcStateService,
    private _router: Router,
    @Inject(MAT_DIALOG_DATA) public data: InsufficientFundsData,
    private dialogRef: MatDialogRef<InsufficientFundsComponent>,
    private botService: BotService
  ) { }

  ngOnInit() {
    if (!this.data.required) {
      this.data.required = new PartoshiAmount(0);
    }

    this.listSpendable('listunspentanon').pipe(takeWhile(() => !this.destroyed))
        .subscribe((spendable) => this.availableBalance = spendable);
    this.listSpendable('listunspent').pipe(takeWhile(() => !this.destroyed))
        .subscribe((spendable) => this.hasEnoughPublic = spendable.particls() > this.total.particls());

    this._rpcState.observe('getwalletinfo').pipe(takeWhile(() => !this.destroyed))
      .subscribe(
        balance => {
          this.pendingBalance = new PartoshiAmount(0);
          if (balance) {
            this.pendingBalance
              .add( new PartoshiAmount(+balance.unconfirmed_anon * Math.pow(10, 8)) )
              .add( new PartoshiAmount(+balance.immature_anon_balance * Math.pow(10, 8)) )
          }
      });

    this.total = new PartoshiAmount(this.data.required.partoshis() - this.pendingBalance.partoshis() - this.availableBalance.partoshis());

    this.botService.search(0, 1, 'EXCHANGE', '', true).then((bots) => {
      this.hasExchangeBot = bots.length > 0;
    }).catch(() => this.hasExchangeBot = false);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  goto(page: string) {
    const tab = page === 'exchange' ? 'exchange' : 'balanceTransfer';
    const queryParams = {tab, requiredPart: this.total.particls(), convertTo: 'anon'};
    this._router.navigate(['wallet', 'main', 'wallet', page], { queryParams });
    this.dialogRef.close();
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
}
