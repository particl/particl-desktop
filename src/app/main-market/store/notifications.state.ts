// import { State, StateToken, Action, StateContext } from '@ngxs/store';
// import { patch } from '@ngxs/store/operators';
// import { MarketActions } from './market.actions';

// import { Subject, merge } from 'rxjs';
// import { takeUntil, tap, filter } from 'rxjs/operators';

// import { MarketSocketService } from '../services/market-rpc/market-socket.service';
// import { isBasicObjectType, getValueOrDefault } from '../shared/utils';
// import { NotificationsStateModel, ListingsCommentNotificationItem } from './market.models';


// const STATE_TOKEN = new StateToken<NotificationsStateModel>('market_notifications');


// const DEFAULT_STATE_VALUES: NotificationsStateModel = {
//   listingComments: {
//     buy: {},
//     sell: {}
//   }
// };

// // TODO: add this state as a child state of market.state

// @State<NotificationsStateModel>({
//   name: STATE_TOKEN,
//   defaults: JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES))
// })
// export class MarketState {

//   private destroy$: Subject<void> = new Subject();

//   // TODO: create selectors for identity notifications (should be in market.state)


//   constructor(
//     private _socketService: MarketSocketService,
//   ) {}

//   // TODO: call this from main.state once the application has started

//   // @Action(MarketActions.StartNotifications)
//   // startNotificationsListeners(ctx: StateContext<NotificationsStateModel>) {
//   //   // ensure we stop any running listeners
//   //   this.destroy$.next();

//   //   const newState = JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES));
//   //   // TODO: load stored data from persistent storage


//   //   const ordersBuyer$ = merge(
//   //     this._socketService.getSocketMessageListener('MPA_REJECT_03').pipe(takeUntil(this.destroy$)),
//   //     this._socketService.getSocketMessageListener('MPA_CANCEL_03').pipe(takeUntil(this.destroy$)),
//   //     this._socketService.getSocketMessageListener('MPA_ACCEPT_03').pipe(takeUntil(this.destroy$)),
//   //     this._socketService.getSocketMessageListener('MPA_COMPLETE').pipe(takeUntil(this.destroy$)),
//   //     this._socketService.getSocketMessageListener('MPA_SHIP').pipe(takeUntil(this.destroy$)),
//   //   ).pipe(
//   //     filter(msg => isBasicObjectType(msg) && (typeof msg.market === 'string') && (msg.market.length > 0)),
//   //     tap(msg => {
//   //       const updated = JSON.parse(JSON.stringify(ctx.getState().orders[msg.market] || NEW_MARKET_ORDER_ITEM));
//   //       updated.buyCount += 1;
//   //       ctx.setState( patch<NotificationsStateModel>({
//   //         orders: patch( { [msg.market]: updated } )
//   //       }));
//   //     }),
//   //     takeUntil(this.destroy$)
//   //   );


//   //   const ordersSeller$ = merge(
//   //     this._socketService.getSocketMessageListener('MPA_BID_03').pipe(takeUntil(this.destroy$)),
//   //     this._socketService.getSocketMessageListener('MPA_CANCEL_03').pipe(takeUntil(this.destroy$)),
//   //     this._socketService.getSocketMessageListener('MPA_LOCK_03').pipe(takeUntil(this.destroy$)),
//   //     this._socketService.getSocketMessageListener('MPA_RELEASE').pipe(takeUntil(this.destroy$)),
//   //   ).pipe(
//   //     filter(msg => isBasicObjectType(msg) && (typeof msg.market === 'string') && (msg.market.length > 0)),
//   //     tap(msg => {
//   //       const updated = JSON.parse(JSON.stringify(ctx.getState().orders[msg.market] || NEW_MARKET_ORDER_ITEM));
//   //       updated.sellCount += 1;
//   //       ctx.setState( patch<NotificationsStateModel>({
//   //         orders: patch( { [msg.market]: updated } )
//   //       }));
//   //     }),
//   //     takeUntil(this.destroy$)
//   //   );


//   //   const comment$ = this._socketService.getSocketMessageListener('MPA_COMMENT_ADD').pipe(
//   //     filter(msg => isBasicObjectType(msg) &&
//   //                   (msg.commentType === 'LISTINGITEM_QUESTION_AND_ANSWERS') &&
//   //                   (getValueOrDefault(msg.receiver, 'string', '').length > 0) &&
//   //                   (getValueOrDefault(msg.target, 'string', '').length > 0)),
//   //     tap(msg => {
//   //       const commentState = ctx.getState().comments[msg.receiver];
//   //       let target = -1;
//   //       if (commentState) {
//   //         if (commentState.buy[msg.target]) {
//   //           target = 0;
//   //         } else if (commentState.sell[msg.target]) {
//   //           target = 1;
//   //         }
//   //       }

//   //       if (target > -1) {
//   //         const targetType = !!target ? 'sell' : 'buy';
//   //         const updated = ctx.getState().comments[msg.receiver][targetType][msg.target];
//   //         ctx.setState( patch<NotificationsStateModel>({
//   //           comments: patch( { [msg.receiver]:  patch({
//   //             [targetType]: patch({
//   //               [msg.target]: patch<ListingsCommentsState>({ count: updated.count + 1 })
//   //             })
//   //           })})
//   //         }));
//   //       }
//   //     }),
//   //     takeUntil(this.destroy$)
//   //   );

//   //   // TODO: persist changes to permanent storage

//   //   merge(ordersBuyer$, ordersSeller$, comment$).pipe(
//   //     takeUntil(this.destroy$)
//   //   ).subscribe();
//   // }


//   // @Action(MarketActions.StopMarketService)
//   // stopMarketServices(ctx: StateContext<NotificationsStateModel>) {
//   //   // NB! don't complete the listener unless intending on creating new during the load action (the market state is not destroyed)
//   //   this.destroy$.next();

//   //   ctx.setState(JSON.parse(JSON.stringify(DEFAULT_STATE_VALUES)));
//   // }


//   // @Action(MarketActions.AddIdentityMarket)
//   // addIdentityMarket(ctx: StateContext<NotificationsStateModel>, { market }: MarketActions.AddIdentityMarket) {
//   //   if (market.receiveAddress.length > 0) {
//   //     ctx.setState(patch<NotificationsStateModel>({
//   //       orders: patch({ [market.receiveAddress]: JSON.parse(JSON.stringify(NEW_MARKET_ORDER_ITEM))}),
//   //       comments: patch({ [market.receiveAddress]: {buy: {}, sell: {}} })
//   //     }));

//   //     // TODO: save to persistent storage
//   //   }
//   // }

// }
