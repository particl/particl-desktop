import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';

import { NotificationService } from 'app/core/notification/notification.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { take, takeWhile } from 'rxjs/operators';


class OrderSummary {

  data: any = {};

  private types: string[] = [
    'buy',
    'sell'
  ]

  constructor() {
    for (const type of this.types) {
      this.data[type] = {
        totalActive: 0,
        items: {}
      }
    }
  }
}
@Injectable()
export class OrderStatusNotifierService implements OnDestroy {

  log: any = Log.create('order-status-notifier.service id:' + Math.floor((Math.random() * 1000) + 1));

  private destroyed: boolean = false;
  private profileAddress: string = '';
  private activeOrders: OrderSummary = new OrderSummary();
  private notificationKey: string = 'timestamp_notifcation_orders';

  constructor(
    private _marketState: MarketStateService,
    private _notification: NotificationService,
    private profileService: ProfileService
  ) {
    this.log.d('order status notifier service running!');
    this.loadOrders();
  }

  public getActiveCount(type: string): number {
    return +((this.activeOrders.data[type] || {}).totalActive || 0);
  }

  private loadOrders() {
    this.profileService.default().pipe(take(1)).subscribe(
      (profile: any) => {
        this.profileAddress = String(profile.address);

        this._marketState.observe('bid')
        .pipe(takeWhile(() => !this.destroyed)) // why are we not waiting for distinct updates only?
        .subscribe(bids => {
          const notifcationTimestamp = +(localStorage.getItem(this.notificationKey) || 0);
          const activeItems = new OrderSummary();

          for (const bid of bids) {
            let type: string;
            if (bid.ListingItem && (bid.ListingItem.seller  === this.profileAddress)) {
              type = 'sell';
            } else if (bid.bidder === this.profileAddress) {
              type = 'buy';
            }
            if (!type) {
              continue;
            }

            const order = new Bid(bid, type);
            const orderHash = order.ListingItem && order.ListingItem.hash.length ? order.ListingItem && order.ListingItem.hash : '';
            if (!orderHash.length) {
              continue;
            }

            if (!order.activeBuySell && !order.doNotify) {
              continue;
            }

            if (!_.isPlainObject(activeItems.data[type].items[orderHash])) {
                const title = order.ListingItem
                                && order.ListingItem.ItemInformation
                                && (typeof order.ListingItem.ItemInformation.title === 'string') ?
                                order.ListingItem.ItemInformation.title : orderHash;
                activeItems.data[type].items[orderHash] = {
                  title: title,
                  activeCount: 0,
                  notificationCount: 0
                }
            }

            if (order.activeBuySell) {
              activeItems.data[type].items[orderHash].count += 1;
              activeItems.data[type].totalActive += 1;
            }
            if (order.doNotify && +order.updatedAt > notifcationTimestamp) {
              activeItems.data[type].items[orderHash].notificationCount += 1;
            }
          };

          localStorage.setItem(this.notificationKey, String(Date.now()));

          this.processUpdates(activeItems);
          this.activeOrders = activeItems;
        })
      }
    );
  }

  private processUpdates(newOrders: OrderSummary) {
    const newTypeKeys = Object.keys(newOrders.data);

    for (const typeKey of newTypeKeys) {
      const bidHashes = Object.keys(newOrders.data[typeKey].items);

      if (typeKey === 'buy') {
        const count = bidHashes.reduce((total, hash) => total + +newOrders.data[typeKey].items[hash].notificationCount, 0);
        if (count > 0) {
          const msg = `${count} ${typeKey} order(s) have been updated.`
          this.sendNotification(msg);
        }
      } else {
        for (const hash of bidHashes) {
          const item = newOrders.data[typeKey].items[hash];
          if (item.notificationCount > 0) {
            const msg = `You have ${item.notificationCount} new ${typeKey} ${+item.notificationCount > 1 ? 'action' : 'actions'} ` +
              `for item ${item.title}`;
            this.sendNotification(msg);
          }
        }
      }
    }
  }

  private sendNotification(message: string) {
    this._notification.sendNotification(message);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
