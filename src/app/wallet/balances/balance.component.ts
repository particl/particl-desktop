import { Component, OnInit, Input } from '@angular/core';
import { BalanceService } from './balance.service';


@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
  providers: [BalanceService]
})
export class BalanceComponent implements OnInit {
  balanceService;
  @Input() typeOfBalance: string; // "ALL", "PRIVATE", "PUBLIC", "STAKE"

  /*this.balance_service.balance_type = this.balance_type;*/
  constructor(private _balanceService: BalanceService) {this.balanceService = _balanceService;}

  ngOnInit() {
  }

  /*
	  TODO:
	  1. round down balance after point (for example 0.956246232656 => 0.956)
	  2. same as 1 but for large balances (500 000 -> 500K)
  */
  getBalanceBeforePoint(): string {
    return this.balanceService.balanceBeforePoint;
  }

  getBalancePoint(): string {
    if(+this.getBalanceAfterPoint === 0) {
      return ''; // Balance = 120 for example, no point needed.
    }

    return '.'; // Point needed
  }

  getBalanceAfterPoint(): string {
    return this.balanceService.balanceAfterPoint;
  }



  getTypeOfBalance(): string {
    return this.typeOfBalance;
  }

}
