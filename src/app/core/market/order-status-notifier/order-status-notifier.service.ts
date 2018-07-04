import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';

import { ListingService } from 'app/core/market/api/listing/listing.service';
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
            'Mark as shipped',
            'Order rejected'
          ];
  public oldOrders: Array<any>;

  constructor(
    private listingService: ListingService,
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

    if (!this.oldOrders || this.oldOrders.length === 0) {
      this.oldOrders = orders.bid.orders;
    } else {
      this.checkOrders(orders.bid.orders);
      this.oldOrders = orders.bid.orders;
    }
  }

  private notifyNewStatus(newOrder: any) {
    this.listingService.get(newOrder.listingItemId).subscribe(response => {
     newOrder.listing = response;

     const message = this.getMessage(newOrder.listing.title, newOrder.messages.action_button);
     this._notification.sendNotification(message);
    });
  }

  checkOrders(newOrders: any) {
    this.oldOrders.forEach(order => {
      newOrders.forEach(newOrder => {
        if (this.compareOrder(order, newOrder)) {
          this.notifyNewStatus(newOrder);
        }
      });
    });
  }

  compareOrder(order: any, newOrder: any) {
    return order.id === newOrder.id &&
            order.messages.action_button !== newOrder.messages.action_button &&
            this.actionStatus.includes(newOrder.messages.action_button)
  }

  private getMessage(title: string, msg: string) {
    switch (msg) {
      case 'Accept bid' :
        return 'New bid on' + title + ' - accept';

      case 'Make payment' :
        return 'Seller accepted your bid, order ' + title + ' ready for payment';

      case 'Mark as shipped' :
        return 'Buyer locked funds, order ' + title + ' ready for shipping';

      case 'Mark as delivered' :
        return 'Seller just shipped ' + title;

      case 'Order rejected' :
        return 'New bid on ' + title + ' - rejected';

      default:
        break;
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
