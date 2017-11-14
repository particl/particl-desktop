import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { StateService } from '../../../core/core.module';

import { Amount } from '../../shared/util/utils';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent {

  @Input() type: string; // "total_balance", "anon_balance", "balance", "staked_balance", "blind_balance"
  private _sub: Subscription;

  get balance() {
    // Round to 4 digits
    return new Amount(this._state.get(this.type) || 0, 4);
  }

  constructor(private _state: StateService) { }

  /**
    * TODO:
    * 1. round down balance after point (for example 0.956246232656 => 0.956)
    * 2. same as 1 but for large balances (500 000 -> 500K)
    */

  getTypeOfBalance(): string {

    switch (this.type) {
      case 'total_balance':
        return 'TOTAL BALANCE';
      case 'balance':
        return 'PUBLIC BALANCE';
      case 'anon_balance':
        return 'PRIVATE BALANCE';
      case 'blind_balance':
        return 'BLIND BALANCE';
      case 'staked_balance':
        return 'STAKE';
    }

    return this.type;
  }

}
