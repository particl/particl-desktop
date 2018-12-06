import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { ListingService } from 'app/core/market/api/listing/listing.service';
import { NotificationService } from 'app/core/notification/notification.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { SettingStateService } from 'app/core/settings/setting-state/setting-state.service';

import { BidCollection } from 'app/core/market/api/bid/bidCollection.model';
import { Bid } from 'app/core/market/api/bid/bid.model';
import { DisplaySettings } from 'app/wallet/settings/models/display/display.settings.model';

@Injectable()
export class OrderStatusNotifierService implements OnDestroy {

  log: any = Log.create('order-status-notifier.service id:' + Math.floor((Math.random() * 1000) + 1));

  private destroyed: boolean = false;
  private notifyOrders: boolean = false;
  profile: any = {};
  private actionStatus: Array<any> =  [
            'Accept bid',
            'Mark as delivered',
            'Make payment',
            'Mark as shipped',
            'Order rejected'
          ];
  public oldOrders: Bid[];
  bids: BidCollection;
  constructor(
    private listingService: ListingService,
    private _marketState: MarketStateService,
    private _rpcState: RpcStateService,
    private _notification: NotificationService,
    private profileService: ProfileService,
    private settingStateService: SettingStateService
  ) {
    this.log.d('order status notifier service running!');
    this.loadOrders();
  }

  loadOrders() {
    // @TODO need to replace with marketplace command so this should probably gone :)
    this._marketState.observe('bid')
      .takeWhile(() => !this.destroyed)
      .map(o => new BidCollection(o, this.profile.address))
      .subscribe(bids => {
        this.bids = bids;
        if (bids.address) {
          this.checkForNewStatus(bids.orders);
        }
      })

    this.settingStateService.observe('currentGUISettings', 'display')
      .takeWhile(() => !this.destroyed)
      .subscribe((display: DisplaySettings) => {
        this.notifyOrders = display.notifyOrders;
      });
    this.loadProfile();
  }


  // TODO: trigger by ZMQ in the future
  checkForNewStatus(orders: Bid[]): void {
    this.log.d('new orders', orders);
    // if no orders: stop
    if (orders.length === 0) {
      return;
    }
    if (this.oldOrders && this.oldOrders.length && this.notifyOrders) {
      this.checkOrders(orders);
    }
    this.oldOrders = orders;
  }

  private notifyNewStatus(newOrder: Bid) {
    this.listingService.get(newOrder.listingItemId).subscribe(response => {
      newOrder.listing = response;

      const message = this.getMessage(newOrder.listing.title, newOrder.messages.action_button);
      this._notification.sendNotification(message);
    });
  }

  checkOrders(newOrders: Bid[]) {
    this.getOrdersToNotifyFor(newOrders).forEach(newOrder => {
      if (this.hasOrderChanged(newOrder.messages.action_button)) {
        this.notifyNewStatus(newOrder);
      }
    });
  }

  private hasOrderChanged(msg: string): boolean {
    return this.actionStatus.includes(msg)
  }

  public getOrdersToNotifyFor(newOrders: Bid[]): Bid[] {
    return  _.differenceWith(newOrders, this.oldOrders, (o1, o2) => {
      return o1.id === o2.id && (o1.messages || {}).action_button === (o2.messages || {}).action_button;
    });
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
