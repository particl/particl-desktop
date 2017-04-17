import { Component, OnInit, Input } from '@angular/core';
import { BalanceService } from './balance.service';


@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
  providers: [BalanceService]
})
export class BalanceComponent implements OnInit {
	balance_service;
	@Input() balance_type: string; // "ALL", "PRIVATE", "PUBLIC", "STAKE"

  constructor(private balanceService: BalanceService) {this.balance_service = balanceService; /*this.balance_service.balance_type = this.balance_type;*/}

  ngOnInit() {
  }

}
