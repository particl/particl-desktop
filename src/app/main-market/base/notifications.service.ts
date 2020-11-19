import { Injectable, OnDestroy } from '@angular/core';
import { Subject, defer, Observable, merge, of, concat, combineLatest } from 'rxjs';
import { switchMap, map, catchError, tap, filter, bufferTime, takeUntil } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';
import { MarketUserActions } from '../store/market.actions';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { MarketSocketService } from '../services/market-rpc/market-socket.service';

import { isBasicObjectType } from '../shared/utils';
import { SocketMessages_v03 } from '../shared/market-socket.models';
import { StartedStatus } from '../store/market.models';
import { OrderUserType, messageListeners as orderMessageListeners } from '../services/orders/orders.models';
import { RespOrderSearchItem } from '../shared/market.models';


@Injectable()
export class NotificationsService implements OnDestroy {

  private destroy$: Subject<void> = new Subject();
  private stopListeners$: Subject<void> = new Subject();


  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _socket: MarketSocketService
  ) {
    combineLatest(
      this._store.select(MarketState.startedStatus).pipe(takeUntil(this.destroy$)),
      this._store.select(MarketState.currentIdentity).pipe(takeUntil(this.destroy$))
    ).pipe(
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
    );
  }


  private startNotifications(): Observable<void> {
    return merge(
      this.initOrderNotifications(),
      this.startOrderNotificationListeners(),
    ).pipe(map(() => null));
  }


  private initOrderNotifications(): Observable<any> {
    const identity = this._store.selectSnapshot(MarketState.currentIdentity);

    return concat(...(['BUYER', 'SELLER'].map(userType =>
      this.fetchActiveOrders(userType as any, identity.address).pipe(
        catchError(() => of([] as string[])),
        filter(orders => orders.length > 0),
        tap(orders => this._store.dispatch(new MarketUserActions.AddOrdersPendingAction(identity.id, userType as any, orders)))
      ))
    ));
  }


  private startOrderNotificationListeners(): Observable<any> {
    const currentIdentity = this._store.selectSnapshot(MarketState.currentIdentity);
    const identityMarkets = currentIdentity.markets.map(m => m.receiveAddress);

    return merge(
      ...orderMessageListeners.buyerActionable.map(li =>
        this._socket.getSocketMessageListener(li as any).pipe(
          bufferTime(2000),
          map((items: SocketMessages_v03.BidReceived[]) => {
            return items.filter(
              m => (typeof m.market === 'string') && identityMarkets.includes(m.market)
            ).map(m => m.objectHash);
          }),
          filter((orderHashes: string[]) => orderHashes.length > 0),
          tap((orderHashes: string[]) =>
            this._store.dispatch(new MarketUserActions.AddOrdersPendingAction(currentIdentity.id, 'BUYER', orderHashes))
          ),
          takeUntil(this.stopListeners$)
        )
      ),
      ...orderMessageListeners.sellerActionable.map(li =>
        this._socket.getSocketMessageListener(li as any).pipe(
          bufferTime(2000),
          map((items: SocketMessages_v03.BidReceived[]) => {
            return items.filter(
              m => (typeof m.market === 'string') && identityMarkets.includes(m.market)
            ).map(m => m.objectHash);
          }),
          filter((orderHashes: string[]) => orderHashes.length > 0),
          tap((orderHashes: string[]) =>
            this._store.dispatch(new MarketUserActions.AddOrdersPendingAction(currentIdentity.id, 'SELLER', orderHashes))
          ),
          takeUntil(this.stopListeners$)
        )
      ),
    );
  }


  private fetchActiveOrders(userType: OrderUserType, identityAddress: string): Observable<string[]> {
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

          return orderItems.filter(
            o => isBasicObjectType(o) && (typeof o.hash === 'string') && (o.hash.length > 0)
          ).map(
            o => o.hash
          );
        }),
      );
    });
  }

}
