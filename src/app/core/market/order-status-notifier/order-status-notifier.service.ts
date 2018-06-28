import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';

import { NotificationService } from 'app/core/notification/notification.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';

@Injectable()
export class OrderStatusNotifierService implements OnDestroy {

  log: any = Log.create('order-status-notifier.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;
  private actionStatus: Array<any> =  [
            'Accept bid',
            'Mark as delivered',
            'Make payment',
            'Mark as shipped'
          ];
  public oldOrders: any;

  constructor(
    private _marketState: MarketStateService,
    private _notification: NotificationService
  ) {
    this.log.d('order status notifier service running!');
  }

  // TODO: trigger by ZMQ in the future
  checkForNewStatus(orders: any): void {
    this.log.d('new orders', orders);
    // if no orders: stop
    if (orders.orders.length === 0) {
      return;
    }

    if (!this.oldOrders || this.oldOrders.allOrders.length === 0) {
      this.oldOrders = orders;
    } else {
      this.oldOrders.allOrders.forEach(order => {
        orders.allOrders.forEach(newOrder => {
          if (
            order.id === newOrder.id &&
            order.messages.action_button !== newOrder.messages.action_button &&
            this.actionStatus.includes(newOrder.messages.action_button)
          ) {
            this.notifyNewStatus(newOrder);
          }
        });
      });
      this.oldOrders = orders;
    }
  }

  private notifyNewStatus(newOrder: any) {
    this._notification.sendNotification('New status update for', newOrder.type + 'order');
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
