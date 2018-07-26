import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

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
    if (this.oldOrders && this.oldOrders.length) {
      this.checkOrders(orders.bid.orders.reverse());
    }
    this.oldOrders = orders.bid.orders.reverse();
  }

  private notifyNewStatus(newOrder: any) {
    this.listingService.get(newOrder.listingItemId).subscribe(response => {
     newOrder.listing = response;

     const message = this.getMessage(newOrder.listing.title, newOrder.messages.action_button);
       this._notification.sendNotification(message);
    });
  }

  checkOrders(newOrders: any) {
    let compOrders = [];
    // For New Orders
    if (this.oldOrders.length !== newOrders.length) {
      compOrders = this.checkForNewOrders(newOrders);
    }
    // OldOrders that are changed
    this.oldOrders.forEach(oldOrder => {
      compOrders.push(newOrders.find(newOrder => this.compareOrder(oldOrder, newOrder)))
    })

    _.without(compOrders, undefined)
      .forEach(newOrder => {
        this.notifyNewStatus(newOrder);
      });
  }

  private compareOrder(order: any, newOrder: any): any {
    return order.id === newOrder.id &&
      order.messages.action_button !== newOrder.messages.action_button &&
      this.actionStatus.includes(newOrder.messages.action_button)
  }

  private checkForNewOrders(newOrders: any): any {
    return _(newOrders).differenceBy(this.oldOrders, 'id').value();
  }

  private getMessage(title: string, msg: string) {
    switch (msg) {
      case 'Accept bid' :
        return 'New bid on \"' + title + '\" - accept or reject it';

      case 'Make payment' :
        return 'Seller accepted your bid, order \"' + title + '\" ready for payment';

      case 'Mark as shipped' :
        return 'Buyer locked funds, order \"' + title + '\" ready for shipping';

      case 'Mark as delivered' :
        return 'Seller just shipped \"' + title + '\"';

      case 'Order rejected' :
        return 'Your bid on \"' + title + '\" was rejected by Seller';

      default:
        break;
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
