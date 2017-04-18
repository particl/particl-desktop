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

  constructor(private _balanceService: BalanceService) {this.balanceService = _balanceService; /*this.balance_service.balance_type = this.balance_type;*/}

  ngOnInit() {
  }

}
