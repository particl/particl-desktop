import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BalanceService } from './balance.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit,OnDestroy {

  @Input() typeOfBalance: string; // "ALL", "PRIVATE", "PUBLIC", "STAKE"
  private _sub: Subscription;
  private _balance: number = 0;

  constructor(public balanceService: BalanceService) {
  }


  ngOnInit() {
    this._sub = this.balanceService.getBalances()
      .subscribe(
        balances => {
          this._balance = balances.getBalance(this.typeOfBalance);
        },
        error => console.log('balanceService subscription error:' + error));
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }


  /*
	  TODO:
	  1. round down balance after point (for example 0.956246232656 => 0.956)
	  2. same as 1 but for large balances (500 000 -> 500K)
  */
  getBalanceBeforePoint(): number {
    return Math.floor(this._balance);
  }

  getBalancePoint(): string {
    //console.log('type: ' + this.typeOfBalance + ' ' + this.getBalanceAfterPoint());
    if (+this.getBalanceAfterPoint(true) === 0) {
      return ''; // Balance = 120 for example, no point needed.
    }

    return '.'; // Point needed
  }

  getBalanceAfterPoint(retzero?): string {
    if((this._balance + '').indexOf('.') >= 0){
      return (this._balance + '').split('.')[1];
    } else {
      return (retzero) ? "0" : "";
    }
  }



  getTypeOfBalance(): string {
    return this.typeOfBalance;
  }

}
