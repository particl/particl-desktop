import { Injectable, OnDestroy } from '@angular/core';
import { Subject, defer, Observable, merge, of, concat, combineLatest } from 'rxjs';
import { switchMap, map, catchError, tap, filter, bufferTime, takeUntil } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { MarketUserActions } from '../store/market.actions';

import { NotificationsService as AppNotifyService } from 'app/main/services/notifications/notifications.service';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { MarketSocketService } from '../services/market-rpc/market-socket.service';

import { isBasicObjectType } from '../shared/utils';
import { SocketMessages_v03 } from '../shared/market-socket.models';
import { StartedStatus } from '../store/market.models';
import { OrderUserType, messageListeners as orderMessageListeners } from '../services/orders/orders.models';
import { RespOrderSearchItem, ORDER_ITEM_STATUS, BID_DATA_KEY } from '../shared/market.models';


enum TextContent {
  NOTIFICATION_TITLE = 'Particl Marketplace',
  BUY_ORDER_DESCRIPTION = 'A Purchased Item has been updated and requires your attention',
  SELL_ORDER_DESCRIPTION = 'An item sold has been updated and requires your attention',
}


@Injectable()
export class NotificationsService implements OnDestroy {

  private destroy$: Subject<void> = new Subject();
  private stopListeners$: Subject<void> = new Subject();


  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _socket: MarketSocketService,
    private _appNotify: AppNotifyService
  ) {

    combineLatest([
      this._store.select(MarketState.startedStatus).pipe(takeUntil(this.destroy$)),
      this._store.select(MarketState.currentIdentity).pipe(takeUntil(this.destroy$))
    ]).pipe(
      tap(() => this.stopListeners$.next()),
      switchMap(results => {
        const isStarted = results[0] === StartedStatus.STARTED;
        const identityId = results[1].id;

        if (isStarted) {
          if (identityId > 0) {
            return concat(this.clearNotifications(), this.startNotifications().pipe(takeUntil(this.stopListeners$)));
          }
          return this.clearNotifications();
        }

        return of({});
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  ngOnDestroy() {
    this.stopListeners$.next();
    this.stopListeners$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  private clearNotifications(): Observable<void> {
    return concat(
      this._store.dispatch(new MarketUserActions.OrderItemsCleared())
      // perform any notification reset activity here (eg: when identity changes, and notification count needs to be reset)
    );
  }


  private startNotifications(): Observable<void> {
    return merge(
      this.initOrderNotifications(),
      this.startOrderNotificationListeners(),
      // Add notification listeners here
    ).pipe(map(() => null));
  }


  private initOrderNotifications(): Observable<any> {
    const identity = this._store.selectSnapshot(MarketState.currentIdentity);

    return concat(...(['BUYER', 'SELLER'].map(userType =>
      this.fetchActiveOrders(userType as any, identity.address, identity.markets.map(m => m.receiveAddress)).pipe(
        catchError(() => of([] as string[])),
        filter(orders => orders.length > 0),
        tap(orders => this._store.dispatch(new MarketUserActions.AddOrdersPendingAction(identity.id, userType as any, orders)))
      ))
    ));
  }


  private startOrderNotificationListeners(): Observable<any> {
    const currentIdentity = this._store.selectSnapshot(MarketState.currentIdentity);
    const identityMarkets = currentIdentity.markets.map(m => m.receiveAddress);

    const buyListener$ = merge(
      ...orderMessageListeners.buyerAlerts.map(li =>
        this._socket.getSocketMessageListener(li as any).pipe(takeUntil(this.stopListeners$))
      )
    ).pipe(
      bufferTime(2000),
      map((items: SocketMessages_v03.BidReceived[]) => {
        return items.filter(
          m => (typeof m.market === 'string') && identityMarkets.includes(m.market)
        ).map(m => m.objectHash);
      }),
      filter((bidHashes: string[]) => bidHashes.length > 0),
      tap((bidHashes: string[]) => {
        this._store.dispatch(new MarketUserActions.AddOrdersPendingAction(currentIdentity.id, 'BUYER', bidHashes));
        this._appNotify.notify(TextContent.NOTIFICATION_TITLE, TextContent.BUY_ORDER_DESCRIPTION);
      }),
      takeUntil(this.stopListeners$)
    );
    const sellListener$ = merge(
      ...orderMessageListeners.sellerAlerts.map(li =>
        this._socket.getSocketMessageListener(li as any).pipe(takeUntil(this.stopListeners$))
      )
    ).pipe(
      bufferTime(2000),
      map((items: SocketMessages_v03.BidReceived[]) => {
        return items.filter(item => (typeof item.market === 'string') && identityMarkets.includes(item.market)
        ).map(m => m.objectHash);
      }),
      filter((bidHashes: string[]) => bidHashes.length > 0),
      tap((bidHashes: string[]) => {
        this._store.dispatch(new MarketUserActions.AddOrdersPendingAction(currentIdentity.id, 'SELLER', bidHashes));
        this._appNotify.notify(TextContent.NOTIFICATION_TITLE, TextContent.SELL_ORDER_DESCRIPTION);
      }),
      takeUntil(this.stopListeners$)
    );

    const cancelListener$ = merge(
      this._socket.getSocketMessageListener('MPA_CANCEL_03').pipe(takeUntil(this.stopListeners$)),
      this._socket.getSocketMessageListener('MPA_REJECT_03').pipe(takeUntil(this.stopListeners$))
    ).pipe(
      bufferTime(2000),
      map((items: SocketMessages_v03.BidReceived[]) => {
        return items.filter(item => (typeof item.market === 'string') && identityMarkets.includes(item.market)
        ).map(m => m.objectHash);
      }),
      filter((bidHashes: string[]) => bidHashes.length > 0),
      tap((bidHashes: string[]) => {
        for (const hash of bidHashes) {
          this._store.dispatch([
            new MarketUserActions.OrderItemActioned('SELLER', hash),
            new MarketUserActions.OrderItemActioned('BUYER', hash),
          ]);
        }
      }),
      takeUntil(this.stopListeners$)
    );

    return merge(
      buyListener$,
      sellListener$,
      cancelListener$
    ).pipe(takeUntil(this.stopListeners$));
  }


  private fetchActiveOrders(userType: OrderUserType, identityAddress: string, marketAddresses: string[]): Observable<string[]> {
    return defer(() => {
      const userQuery = [
        userType === 'BUYER' ? identityAddress : null,
        userType === 'SELLER' ? identityAddress : null
      ];
      return this._rpc.call('order', ['search', 0, 1_000_000, 'DESC', 'created_at', null, null, ...userQuery]).pipe(
        catchError(() => of([])),
        map((orderItems: RespOrderSearchItem[]) => {
          if (!Array.isArray(orderItems)) {
            return [];
          }

          const actionableOrderStatuses: string[] = userType === 'BUYER'
          ? [
            ORDER_ITEM_STATUS.ACCEPTED,
            ORDER_ITEM_STATUS.SHIPPED
          ]
          : [
            ORDER_ITEM_STATUS.CREATED,
            ORDER_ITEM_STATUS.ESCROW_REQUESTED,
            ORDER_ITEM_STATUS.ESCROW_COMPLETED,
          ];

          return orderItems.filter(o => {
            const isValidItem = isBasicObjectType(o) &&
                                (typeof o.hash === 'string') && (o.hash.length > 0) &&
                                Array.isArray(o.OrderItems) && (o.OrderItems.length > 0) &&
                                isBasicObjectType(o.OrderItems[0].Bid) &&
                                Array.isArray(o.OrderItems[0].Bid.BidDatas) && (o.OrderItems[0].Bid.BidDatas.length > 0);

            if (isValidItem) {
              const marketKeyItem = o.OrderItems[0].Bid.BidDatas.find(bd => bd.key === BID_DATA_KEY.MARKET_KEY);
              if (marketKeyItem) {
                return  actionableOrderStatuses.includes(o.OrderItems[0].status) &&
                        marketAddresses.includes(marketKeyItem.value);
              }
            }
            return false;
          }).map(o => {
            if (Array.isArray(o.OrderItems[0].Bid.ChildBids)) {
              const sortedChildBids = o.OrderItems[0].Bid.ChildBids.sort((a, b) =>
                (isBasicObjectType(b) && +b.generatedAt || 0) - (isBasicObjectType(a) && +a.generatedAt || 0)
              );

              if ((sortedChildBids.length > 0) && (typeof sortedChildBids[0].hash === 'string') && (sortedChildBids[0].hash.length > 0)) {
                return sortedChildBids[0].hash;
              }
            }
            return o.OrderItems[0].Bid.hash || '';
          });
        }),
      );
    });
  }

}
