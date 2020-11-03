import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, defer } from 'rxjs';
import { catchError, map, concatAll, reduce } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../store/market.state';

import { MarketRpcService } from '../services/market-rpc/market-rpc.service';
import { BidOrderService } from '../services/orders/orders.service';
import { isBasicObjectType, getValueOrDefault, parseMarketResponseItem } from '../shared/utils';
import { PartoshiAmount } from 'app/core/util/utils';
import { OrderCounts, AllCounts, ListingCounts } from './overview.models';
import { OrderItem } from '../services/orders/orders.models';
import { ORDER_ITEM_STATUS, RespListingItem } from '../shared/market.models';


enum TextContent {
  LABEL_REGION_ALL = 'All regions',
  LABEL_REGION_WORLDWIDE = 'Worldwide / Global',
  LABEL_REGION_NORTH_AMERICA = 'North Americas',
  LABEL_REGION_SOUTH_AMERICA = 'Cerntral & Southern America',
  LABEL_REGION_EUROPE = 'Europe',
  LABEL_REGION_MIDDLE_EAST_AFRICA = 'Middle East & Africa',
  LABEL_REGION_ASIA_PACIFIC = 'Asia Pacific',

  OPEN_MARKET_NAME = 'Open Market'
}


@Injectable()
export class OverviewService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _orderService: BidOrderService
  ) { }


  fetchDataCounts(): Observable<AllCounts> {
    return of(...[
      of({}).pipe(map(() => {
        const counts: AllCounts = {
          markets: {
            joinedMarkets: this._store.selectSnapshot(MarketState.currentIdentity).markets.length
          }
        };
        return counts;
      })),

      this.fetchOrderInfo().pipe(map((orderInfo) => {
        const counts: AllCounts = {
          orders: orderInfo
        };
        return counts;
      })),

      this.fetchListingsCounts().pipe(map((listingInfo) => {
        const counts: AllCounts = {
          listings: listingInfo
        };
        return counts;
      }))

    ]).pipe(concatAll());
  }


  private fetchOrderInfo(): Observable<OrderCounts> {
    return forkJoin({
      buyers: this._orderService.fetchBids('BUYER', 'created_at').pipe(catchError(() => of([] as OrderItem[]))),
      sellers: this._orderService.fetchBids('SELLER', 'created_at').pipe(catchError(() => of([] as OrderItem[])))
    }).pipe(
      map(results => {
        const counts: OrderCounts = {
          buyActive: 0,
          buyWaiting: 0,
          sellActive: 0,
          sellWaiting: 0,
          fundsInEscrow: new PartoshiAmount(0)
        };

        results.buyers.forEach(ord => {
          if (ord.currentState) {
            if ((ord.currentState.actions.PRIMARY.length > 0)) {
              counts.buyWaiting += 1;
            }
            if (!ord.currentState.state.isFinalState) {
              counts.buyActive += 1;

              if (
                (ord.currentState.state.buyflow === 'MAD_CT') &&
                (
                  (ord.currentState.state.stateId === ORDER_ITEM_STATUS.ESCROW_COMPLETED) ||
                  (ord.currentState.state.stateId === ORDER_ITEM_STATUS.SHIPPED)
                )
              ) {
                  counts.fundsInEscrow.add(new PartoshiAmount(
                    +`${ord.pricing.totalRequired.whole}${ord.pricing.totalRequired.sep}${ord.pricing.totalRequired.fraction}`, false));
                }
            }

          }
        });

        results.sellers.forEach(ord => {
          if (ord.currentState) {
            if ((ord.currentState.actions.PRIMARY.length > 0)) {
              counts.sellWaiting += 1;
            }
            if (!ord.currentState.state.isFinalState) {
              counts.sellActive += 1;

              if (
                (ord.currentState.state.buyflow === 'MAD_CT') &&
                (
                  (ord.currentState.state.stateId === ORDER_ITEM_STATUS.ESCROW_COMPLETED) ||
                  (ord.currentState.state.stateId === ORDER_ITEM_STATUS.SHIPPED)
                )
              ) {
                  counts.fundsInEscrow.add(new PartoshiAmount(
                    +`${ord.pricing.totalRequired.whole}${ord.pricing.totalRequired.sep}${ord.pricing.totalRequired.fraction}`, false));
                }
            }

          }
        });

        return counts;
      })
    );
  }


  private fetchListingsCounts(): Observable<ListingCounts> {
    return defer(() => {
      const obsCalls = [];
      const identity = this._store.selectSnapshot(MarketState.currentIdentity);
      const expirationMax = this._store.selectSnapshot(MarketState.settings).daysToNotifyListingExpired * 86_400_000;
      const now = Date.now();
      const cutoff = now - expirationMax;

      identity.markets.map(
        market => market.receiveAddress
      ).forEach(
        mAddr => obsCalls.push(
          this._rpc.call('item', ['search', 0, 100_000_000, 'DESC', 'expired_at', mAddr, null, identity.address]).pipe(
            catchError(() => of([] as RespListingItem[])),
            map((resp: RespListingItem[]) => {
              let expiredCount = 0;

              if (Array.isArray(resp)) {

                for (let ii = 0; ii < resp.length; ii++) {
                  if (isBasicObjectType(resp[ii])) {
                    if ((+resp[ii].expiredAt <= now) && (+resp[ii].expiredAt > cutoff)) {
                      expiredCount++;
                    } else {
                      break;
                    }
                  }
                }

              }
              return expiredCount;
            })
          )
        )
      );

      return of(...obsCalls).pipe(

        concatAll<number>(),
        reduce((acc, current) => acc + current, 0),
        map((total) => {
          const counts: ListingCounts = { expiredListings: total };
          return counts;
        })
      );
    });
  }

}
