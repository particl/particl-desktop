import { Component, Input } from '@angular/core';
import { StateService } from '../../core/state/state.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent {

  @Input() type: string; // "total_balance", "anon_balance", "balance", "staked_balance", "blind_balance"
  private _sub: Subscription;

  get balance() {
    return this._state.get(this.type);
  }

  constructor(private _state: StateService) { }

  /**
	  * TODO:
	  * 1. round down balance after point (for example 0.956246232656 => 0.956)
	  * 2. same as 1 but for large balances (500 000 -> 500K)
    */
  getBalanceBeforePoint(): number {
    return Math.floor(this.balance);
  }

  getBalancePoint(): string {
    return +this.getBalanceAfterPoint(true) === 0 ? '' : '.';
  }

  getBalanceAfterPoint(retzero?: boolean): string {
    if ((this.balance + '').indexOf('.') >= 0) {
      return (this.balance + '').split('.')[1];
    } else {
      return (retzero) ? '0' : '';
    }
  }

  getTypeOfBalance(): string {

    switch (this.type) {
      case 'total_balance':
        return 'TOTAL';
      case 'balance':
        return 'PUBLIC';
      case 'anon_balance':
        return 'PRIVATE';
      case 'blind_balance':
        return 'BLIND';
      case 'staked_balance':
        return 'STAKE';
    }

    return this.type;
  }

}
