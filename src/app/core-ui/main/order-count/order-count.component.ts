import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { OrderStatusNotifierService } from 'app/core/market/order-status-notifier/order-status-notifier.service';
import { Bid } from 'app/core/market/api/bid/bid.model';

@Component({
  selector: 'app-order-count',
  templateUrl: './order-count.component.html',
  styleUrls: ['./order-count.component.scss']
})
export class OrderCountComponent implements OnInit, OnDestroy {

  private log: any = Log.create('order-count.component id:' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  @Input() type: string;
  profile: any = {};
  orders: Bid;
  constructor(
    private marketState: MarketStateService,
    private profileService: ProfileService,
    private _orderStatusNotifierService: OrderStatusNotifierService
  ) {}

  ngOnInit() {
    this.marketState.observe('bid')
      .takeWhile(() => !this.destroyed)
      .distinctUntilChanged()
      .map(o => new Bid(o, this.profile.address, this.type))
      .subscribe(orders => {
        this.orders = orders;
        this._orderStatusNotifierService.checkForNewStatus(orders);
      })
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.default().take(1).subscribe(
      profile => {
        this.profile = profile;
      });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
