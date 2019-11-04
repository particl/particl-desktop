import { Component, OnInit, OnDestroy, Input, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RpcStateService } from 'app/core/core.module';
import { takeWhile, map } from 'rxjs/operators';
import { PartoshiAmount } from 'app/core/util/utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-insufficient-funds',
  templateUrl: './insufficient-funds.component.html',
  styleUrls: ['./insufficient-funds.component.scss']
})
export class InsufficientFundsComponent implements OnInit, OnDestroy {

  private destroyed: boolean = false;
  public availableBalance: PartoshiAmount = new PartoshiAmount(0);
  public feeBuffer: PartoshiAmount = new PartoshiAmount(0);
  public total: PartoshiAmount = new PartoshiAmount(0);

  constructor(
    private _rpcState: RpcStateService,
    private _router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<InsufficientFundsComponent>
  ) { }

  ngOnInit() {
    this._rpcState.observe('unspent_anon').pipe(
      takeWhile(() => !this.destroyed),
      map((utxos) => {
        this.availableBalance = new PartoshiAmount(0);
        for (let ii = 0; ii < utxos.length; ++ii) {
          const utxo = utxos[ii];
          let spendable = true;
          if ('spendable' in utxo) {
            spendable = utxo.spendable;
          }
          if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
            const amount = new PartoshiAmount(utxo.amount * Math.pow(10, 8));
            this.availableBalance.add(amount);
          };
        }
      })
    );
    this.feeBuffer = new PartoshiAmount(this.data.required.partoshis() * 0.05);

    this.total = new PartoshiAmount(this.data.required.partoshis() + this.feeBuffer.partoshis() - this.availableBalance.partoshis());
  }

  ngOnDestroy() {
    this.destroyed = false;
  }

  goto(page: string) {
    const tab = page === 'exchange' ? 'exchange' : 'balanceTransfer';
    const queryParams = {tab, requiredPart: this.total.particls(), convertTo: 'anon'};
    this._router.navigate(['wallet', 'main', 'wallet', page], { queryParams });
    this.dialogRef.close();
  }
}
