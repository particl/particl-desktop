import { Injectable } from '@angular/core';
import { Observable, throwError, of, iif, defer } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { MarketRpcService } from '../market-rpc/market-rpc.service';
import { RegionListService } from '../region-list/region-list.service';

import { PartoshiAmount } from 'app/core/util/utils';
import { getValueOrDefault, isBasicObjectType, parseImagePath } from '../../shared/utils';
import { BID_DATA_KEY, ORDER_ITEM_STATUS, RespOrderSearchItem, ESCROW_TYPE } from '../../shared/market.models';
import {
  OrderItem,
  OrderUserType,
  BuyFlowType,
  BuyFlowOrderType,
  IBuyflowController,
  BuyFlowStore,
  BuyFlow,
  BuyFlowStateStore,
  BuyFlowState,
  BuyFlowActionStore,
  ActionTransitionParams,
  BuyflowStateDetails,
  StateStatusClass
} from './orders.models';


enum TextContent {
  STATE_INVALID_LABEL = '<unsupported>',
  STATE_INVALID_STATUSTEXT = '<unsupported>',

  STATE_CREATED_LABEL = 'Bidding',
  STATE_CREATED_STATUS_BUYER = 'Waiting for Seller to manually accept (or reject) your bid',
  STATE_CREATED_STATUS_SELLER = 'Buyer wants to purchase this item - approve or reject this bid to continue',

  STATE_REJECTED_LABEL = 'Rejected',
  STATE_REJECTED_STATUS_BUYER = 'Seller rejected bid on this item, bid has been cancelled (no money was spent)',
  STATE_REJECTED_STATUS_SELLER = 'You have rejected this bid and the bid has been cancelled',

  STATE_CANCELLED_LABEL = 'Cancelled',
  STATE_CANCELLED_STATUS_BUYER = 'Bid has been cancelled',
  STATE_CANCELLED_STATUS_SELLER = 'Bid has been cancelled',

  STATE_ACCEPTED_LABEL = 'Accepted',
  STATE_ACCEPTED_STATUS_BUYER = 'Seller accepted your bid - please make the request for escrow to be created',
  STATE_ACCEPTED_STATUS_SELLER = 'Awaiting on buyer to confirm proceeding to creating escrow',

  STATE_ESCROW_LOCKED_LABEL = 'Escrow',
  STATE_ESCROW_LOCKED_STATUS_BUYER = 'Waiting on seller to complete the escrow',
  STATE_ESCROW_LOCKED_STATUS_SELLER = 'Buyer has requested escrow - please proceed to completing your escrow payment (this will lock the funds to escrow)',

  STATE_ESCROW_COMPLETED_LABEL = 'Packaging',
  STATE_ESCROW_COMPLETED_STATUS_BUYER = 'Funds locked in escrow, waiting for Seller to process order for shipping',
  STATE_ESCROW_COMPLETED_STATUS_SELLER = 'Order is ready to ship - when sent, mark order as shipped and await its delivery',

  STATE_SHIPPED_LABEL = 'Shipping',
  STATE_SHIPPED_STATUS_BUYER = 'Order has been shipped - when you receive it, mark it as delivered and the escrow funds will be released',
  STATE_SHIPPED_STATUS_SELLER = 'Order sent to buyer, waiting for buyer to confirm the delivery',

  STATE_COMPLETE_LABEL = 'Completed',
  STATE_COMPLETE_STATUS_BUYER = 'Successfully finalized order',
  STATE_COMPLETE_STATUS_SELLER = 'Order delivery confirmed by Buyer - order successfully finalized',

  ACTION_CANCEL_LABEL = 'Cancel Bid',
  ACTION_CANCEL_TOOLTIP = 'Cancel the bid request',

  ACTION_REJECT_LABEL = 'Reject bid & cancel bid',
  ACTION_REJECT_TOOLTIP = 'Reject this bid, cancelling the bid request',

  ACTION_ACCEPT_LABEL = 'Accept bid',
  ACTION_ACCEPT_TOOLTIP = 'Approve this bid and sell to this Buyer',

  ACTION_REQUEST_ESCROW_LABEL = 'Request Escrow',
  ACTION_REQUEST_ESCROW_TOOLTIP = 'Confirm your escrow contribution and request seller to confirm theirs',

  ACTION_COMPLETE_ESCROW_LABEL = 'Complete escrow',
  ACTION_COMPLETE_ESCROW_TOOLTIP = 'Finalize the creation of the escrow',

  ACTION_SHIP_LABEL = 'Mark as shipped',
  ACTION_SHIP_TOOLTIP = 'Confirm that the order has been shipped to Buyer',

  ACTION_COMPLETE_LABEL = 'Mark as delivered',
  ACTION_COMPLETE_TOOLTIP = 'Confirm that you have received the order',

  PLACEHOLDER_REJECTED = 'Bid rejected',
  PLACEHOLDER_WAITING_FOR_SELLER = 'Waiting for seller',
  PLACEHOLDER_CANCELLED = 'Bid Cancelled',
  PLACEHOLDER_ESCROW_PENDING = 'Waiting for Buyer',
  PLACEHOLDER_ESCROW_PENDING_TOOLTIP = 'Waiting for buyer to proceed to escrow step',
  PLACEHOLDER_SHIPPING_PENDING_TOOLTIP = 'Shipment of item is pending',
  PLACEHOLDER_DELIVERY_PENDING = 'Waiting for delivery',
  PLACEHOLDER_DELIVERY_PENDING_TOOLTIP = 'Awaiting confirmation of successful delivery by Buyer',
  PLACEHOLDER_ORDER_COMPLETE = 'Order complete',

  REJECT_REASON_OUT_OF_STOCK = 'Out of stock',
  REJECT_REASON_NO_REASON = 'No reason provided',
  REJECT_REASON_UNKNOWN = 'Unknown reason provided'
}


@Injectable()
export class BidOrderService implements IBuyflowController {

  private defaultMarketImage: string;

  private buyflows: BuyFlowStore = {
    UNSUPPORTED: this.buildBuyflowUnsupported(),
    MAD_CT: this.buildBuyFlowMadCT()
  };

  private rejectionOptions: {[key: string]: string} = {
    OUT_OF_STOCK: TextContent.REJECT_REASON_OUT_OF_STOCK,
    NO_REASON: TextContent.REJECT_REASON_NO_REASON
  };


  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _regionService: RegionListService
  ) {
    this.defaultMarketImage = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;
  }


  fetchBids(
    userType: OrderUserType,
    orderField: 'created_at' | 'updated_at' = 'created_at',
    orderItemStatus?: ORDER_ITEM_STATUS,
    listingItemId?: number
  ): Observable<OrderItem[]> {
    const identity = this._store.selectSnapshot(MarketState.currentIdentity);
    const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
    const userQuery = [
      userType === 'BUYER' ? identity.address : null,
      userType === 'SELLER' ? identity.address : null
    ];
    return this._rpc.call(
      'order', ['search', 0, 1_000_000, 'DESC', orderField, +listingItemId || null, orderItemStatus || null, ...userQuery]
    ).pipe(
      map((respItems: RespOrderSearchItem[]) => {
        const items: OrderItem[] = [];

        if (Array.isArray(respItems)) {
          respItems.forEach(respItem => {
            const orderItem = this.buildCompleteOrderItem(respItem, marketUrl);
            if (orderItem && (orderItem.orderId > 0)) {
              items.push(orderItem);
            }
          });

          const countryCodes = items.map(item => item.shippingDetails.country);
          const countries = this._regionService.findCountriesByIsoCodes(countryCodes);
          items.forEach(item => {
            const found = countries.find(c => c.iso === item.shippingDetails.country);
            if (found) {
              item.shippingDetails.country = found.name;
            }
          });
        }

        return items;
      })
    );
  }

  getRejectReasons(): {key: string, label: string}[] {
    return Object.keys(this.rejectionOptions).map(key => ({key, label: this.rejectionOptions[key]}));
  }


  getListenerIdsForUser(userType: OrderUserType): string[]  {
    // @TODO: zaSmilingIdiot 2020-09-21 -> Listeners should be a factor of the current buyflow
    //  This needs to be moved to the buyflow object and a lookup from there needs to occur instead of the below 'manual' calc.
    let listeners: string[] = [];

    if (userType === 'SELLER') {
      listeners = ['MPA_BID_03', 'MPA_CANCEL_03', 'MPA_LOCK_03', 'MPA_RELEASE'];
    } else if (userType === 'BUYER') {
      listeners = ['MPA_REJECT_03', 'MPA_CANCEL_03', 'MPA_ACCEPT_03', 'MPA_COMPLETE', 'MPA_SHIP'];
    }

    return listeners;
  }


  getOrderedStateList(buyflow: BuyFlowType): BuyFlowState[] {
    const selectedBuyflow = isBasicObjectType(this.buyflows[buyflow]) ? this.buyflows[buyflow] : this.buyflows.UNSUPPORTED;
    const states = Object.keys(selectedBuyflow.states).map(s => selectedBuyflow.states[s] as BuyFlowState);

    return [
      ...states.filter(s => s.order >= 0).sort((a, b) => a.order - b.order),
      ...states.filter(s => s.order < 0).sort((a, b) => b.order - a.order)
    ];
  }


  getStateDetails(buyflow: BuyFlowType, stateId: BuyFlowOrderType, user: OrderUserType): BuyflowStateDetails {
    if (buyflow && isBasicObjectType(this.buyflows[buyflow]) && stateId && isBasicObjectType(this.buyflows[buyflow].states[stateId])) {
      const hasActions = Array.isArray(this.buyflows[buyflow].actions[stateId]);
      return {
        state: this.buyflows[buyflow].states[stateId],
        actions: {
          PRIMARY: hasActions ? this.buyflows[buyflow].actions[stateId].filter(
            a => (a.actionType === 'PRIMARY') && (user ? a.user === user : true)
          ) : [],
          ALTERNATIVE: hasActions ? this.buyflows[buyflow].actions[stateId].filter(
            a => (a.actionType === 'ALTERNATIVE') && (user ? a.user === user : true)
          ) : [],
          PLACEHOLDER_LABEL: hasActions ? this.buyflows[buyflow].actions[stateId].filter(
            a => (a.actionType === 'PLACEHOLDER_LABEL') && (user ? a.user === user : true)
          ) : []
        }
      };
    }

    return {
      state: this.buyflows.UNSUPPORTED.states.UNKNOWN,
      actions: { PRIMARY: [], ALTERNATIVE: [], PLACEHOLDER_LABEL: [] }
    };
  }


  actionOrderItem(
    orderItem: OrderItem, toState: BuyFlowOrderType, asUser: OrderUserType, otherParams?: ActionTransitionParams
  ): Observable<OrderItem> {
    if (!isBasicObjectType(orderItem) || !isBasicObjectType(orderItem.currentState) || !orderItem.currentState.state) {
      return throwError(() => of('INVALID ORDERITEM'));
    }

    const buyflow = orderItem.currentState.state.buyflow;
    const currentState = orderItem.currentState.state.stateId;
    const buyflowStates = this.getStateDetails(buyflow, currentState, asUser);
    const actionable = buyflowStates.actions.PRIMARY.find(a => a.toState === toState) ||
          buyflowStates.actions.ALTERNATIVE.find(a => a.toState === toState);

    if (!actionable) {
      return throwError(() => of('INVALID ACTION'));
    }

    return actionable.transition(orderItem, otherParams || {}).pipe(
      concatMap((isSuccessful: boolean) => iif(
        () => isSuccessful,

        // Fake a 'order get' request, since that doesn't exist: search for orders with increased criteria to narrow the result set,
        //  and then find the correct one...
        defer(() => this.fetchBids(asUser, 'updated_at', actionable.toState as ORDER_ITEM_STATUS, orderItem.listing.id).pipe(
          map((items: OrderItem[]) => items.find(oi => oi.orderId === orderItem.orderId) || orderItem)
        )),

        // wasn't updated, so return the existing orderItem
        defer(() => of(orderItem))
      ))
    );
  }


  private actionBidAccept(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean> {
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    return this._rpc.call('bid', ['accept', orderItem.baseBidId, identityId ]).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }

  private actionBidReject(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean> {
    const params = ['reject', orderItem.baseBidId];
    params.push(this._store.selectSnapshot(MarketState.currentIdentity).id);

    if (isBasicObjectType(extraParams) && (typeof extraParams.memo === 'string')) {
      params.push(extraParams.memo);
    }
    return this._rpc.call('bid', params).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }

  private actionBidCancel(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean> {
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    return this._rpc.call('bid', ['cancel', orderItem.baseBidId, identityId ]).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }

  private actionBidEscrowLock(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean> {
    const params = ['lock', orderItem.orderItemId];

    if (isBasicObjectType(extraParams)) {
      if (extraParams[BID_DATA_KEY.DELIVERY_EMAIL]) {
        params.push(BID_DATA_KEY.DELIVERY_EMAIL, extraParams[BID_DATA_KEY.DELIVERY_EMAIL]);
      }
      if (extraParams[BID_DATA_KEY.DELIVERY_PHONE]) {
        params.push(BID_DATA_KEY.DELIVERY_PHONE, extraParams[BID_DATA_KEY.DELIVERY_PHONE]);
      }
    }
    return this._rpc.call('escrow', params).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }

  private actionBidEscrowComplete(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean> {
    const params = ['complete', orderItem.orderItemId];

    if (isBasicObjectType(extraParams) && extraParams.memo) {
      params.push(extraParams.memo);
    }
    return this._rpc.call('escrow', params).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }

  private actionOrderShip(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean> {
    const params = ['ship', orderItem.orderItemId];

    if (isBasicObjectType(extraParams) && extraParams.memo) {
      params.push(extraParams.memo);
    }
    return this._rpc.call('orderitem', params).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }

  private actionOrderComplete(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean> {
    const params = ['release', orderItem.orderItemId];

    if (isBasicObjectType(extraParams) && extraParams.memo) {
      params.push(extraParams.memo);
    }
    return this._rpc.call('escrow', params).pipe(
      map((resp) => isBasicObjectType(resp) && (resp.result === 'Sent.'))
    );
  }

  private actionInvalid(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean> {
    return throwError(() => of('INVALID ACTION'));
  }


  private buildBasicOrderItem(src: RespOrderSearchItem): OrderItem {
    const newOrder: OrderItem = {
      orderId: 0,
      orderItemId: 0,
      orderHash: '',
      baseBidId: 0,
      marketKey: '',
      created: 0,
      updated: 0
    };

    if (!isBasicObjectType(src) ||
        !(Array.isArray(src.OrderItems) && src.OrderItems.length > 0) ||
        !isBasicObjectType(src.OrderItems[0]) ||
        !isBasicObjectType(src.OrderItems[0].Bid) ||
        !isBasicObjectType(src.OrderItems[0].Bid.ListingItem)
    ) {
      return newOrder;
    }

    newOrder.orderId = +src.id > 0 ? +src.id : newOrder.orderId;
    const orderItem = src.OrderItems[0];
    newOrder.orderItemId = +orderItem.id > 0 ? +orderItem.id : newOrder.orderItemId;
    newOrder.orderHash = getValueOrDefault(src.hash, 'string', newOrder.orderHash);
    newOrder.baseBidId = +orderItem.Bid.id > 0 ? +orderItem.Bid.id : newOrder.orderItemId;
    newOrder.created = +src.createdAt > 0 ? +src.createdAt : newOrder.created;
    newOrder.updated = +src.updatedAt > 0 ? +src.updatedAt : newOrder.updated;

    if (Array.isArray(orderItem.Bid.BidDatas)) {
      orderItem.Bid.BidDatas.forEach(bidData => {
        if (isBasicObjectType(bidData)) {
          switch (bidData.key) {
            case BID_DATA_KEY.MARKET_KEY:
              newOrder.marketKey = getValueOrDefault(bidData.value, 'string', newOrder.marketKey);
              break;
            case BID_DATA_KEY.ORDER_HASH:
              newOrder.orderHash = getValueOrDefault(bidData.value, 'string', newOrder.orderHash);
              break;
            default:
              break;
          }
        }
      });
    }

    return newOrder;
  }


  private buildCompleteOrderItem(src: RespOrderSearchItem, marketUrl: string): OrderItem {
    const newOrder = this.buildBasicOrderItem(src);
    let buyflowType: ESCROW_TYPE = null;

    newOrder.listing = {
      title: '',
      image: this.defaultMarketImage,
      id: 0,
      hash: '',
      hashPrefix: ''
    };

    newOrder.pricing = {
      basePrice: { whole: '', sep: '', fraction: '' },
      shippingPrice: { whole: '', sep: '', fraction: '' },
      subTotal: { whole: '', sep: '', fraction: '' },
      escrowAmount: { whole: '', sep: '', fraction: '' },
      totalRequired: { whole: '', sep: '', fraction: '' },
    };

    newOrder.shippingDetails = {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      code: '',
      state: '',
      country: '',
    };

    newOrder.contactDetails = {
      email: '',
      phone: ''
    };

    if (!(newOrder.orderId > 0) || !(newOrder.orderItemId > 0) || !(newOrder.baseBidId > 0)) {
      return newOrder;
    }

    if (Array.isArray(src.OrderItems[0].Bid.ChildBids) && src.OrderItems[0].Bid.ChildBids.length > 0 ) {

      // find the child bid with the highest quantity of bid datas
      let foundBidDatas = src.OrderItems[0].Bid.BidDatas;
      src.OrderItems[0].Bid.ChildBids.forEach(childBid => {
        if (isBasicObjectType(childBid) && Array.isArray(childBid.BidDatas) && childBid.BidDatas.length > foundBidDatas.length) {
          foundBidDatas = childBid.BidDatas;
        }
      });

      // we always have 2 at least, since ORDER_HASH and MARKET_KEY are always present. Additional items means extra info available
      if (foundBidDatas.length > 2) {
        newOrder.extraDetails = {
          escrowMemo: '',
          shippingMemo: '',
          releaseMemo: '',
          escrowTxn: '',
          releaseTxn: '',
          rejectionReason: ''
        };
        foundBidDatas.forEach(d => {
          if (isBasicObjectType(d)) {
            switch (d.key) {
              case BID_DATA_KEY.ESCROW_MEMO:
                newOrder.extraDetails.escrowMemo = getValueOrDefault(d.value, 'string', newOrder.extraDetails.escrowMemo);
                break;
              case BID_DATA_KEY.SHIPPING_MEMO:
                newOrder.extraDetails.shippingMemo = getValueOrDefault(d.value, 'string', newOrder.extraDetails.shippingMemo);
                break;
              case BID_DATA_KEY.RELEASE_MEMO:
                newOrder.extraDetails.releaseMemo = getValueOrDefault(d.value, 'string', newOrder.extraDetails.releaseMemo);
                break;
              case BID_DATA_KEY.ESCROW_TX_ID:
                newOrder.extraDetails.escrowTxn = getValueOrDefault(d.value, 'string', newOrder.extraDetails.escrowTxn);
                break;
              case BID_DATA_KEY.RELEASE_TX_ID:
                newOrder.extraDetails.releaseTxn = getValueOrDefault(d.value, 'string', newOrder.extraDetails.releaseTxn);
                break;
              case BID_DATA_KEY.REJECT_REASON:
                const reasonKey = getValueOrDefault(d.value, 'string', newOrder.extraDetails.releaseTxn);
                newOrder.extraDetails.rejectionReason = this.rejectionOptions[reasonKey] || TextContent.REJECT_REASON_UNKNOWN;
                break;
              case BID_DATA_KEY.DELIVERY_EMAIL:
                newOrder.contactDetails.email = getValueOrDefault(d.value, 'string', newOrder.contactDetails.email);
                break;
              case BID_DATA_KEY.DELIVERY_PHONE:
                newOrder.contactDetails.phone = getValueOrDefault(d.value, 'string', newOrder.contactDetails.phone);
                break;
            }
          }
        });
      }

    }

    if (isBasicObjectType(src.ShippingAddress)) {
      newOrder.shippingDetails.name = `${getValueOrDefault(src.ShippingAddress.firstName, 'string', '')} ${getValueOrDefault(src.ShippingAddress.lastName, 'string', '')}`;
      newOrder.shippingDetails.addressLine1 = getValueOrDefault(
        src.ShippingAddress.addressLine1, 'string', newOrder.shippingDetails.addressLine1
      );
      newOrder.shippingDetails.addressLine2 = getValueOrDefault(
        src.ShippingAddress.addressLine2, 'string', newOrder.shippingDetails.addressLine2
      );
      newOrder.shippingDetails.city = getValueOrDefault(
        src.ShippingAddress.city, 'string', newOrder.shippingDetails.city
      );
      newOrder.shippingDetails.code = getValueOrDefault(
        src.ShippingAddress.zipCode, 'string', newOrder.shippingDetails.code
      );
      newOrder.shippingDetails.state = getValueOrDefault(
        src.ShippingAddress.state, 'string', newOrder.shippingDetails.state
      );
      newOrder.shippingDetails.country = getValueOrDefault(
        src.ShippingAddress.country, 'string', newOrder.shippingDetails.country
      );
    }

    let itemCountry = '';
    const listingItem = src.OrderItems[0].Bid.ListingItem;

    const itemViewer: OrderUserType = +listingItem.listingItemTemplateId > 0 ? 'SELLER' : 'BUYER';

    if (isBasicObjectType(listingItem.ItemInformation)) {
      newOrder.listing.title = getValueOrDefault(listingItem.ItemInformation.title, 'string', newOrder.listing.title);
      newOrder.listing.hash = getValueOrDefault(listingItem.hash, 'string', newOrder.listing.hash);
      newOrder.listing.hashPrefix = newOrder.listing.hash.substr(0, 6);
      newOrder.listing.id = +listingItem.id > 0 ? +listingItem.id : newOrder.listing.id;

      if (Array.isArray(listingItem.ItemInformation.Images) && listingItem.ItemInformation.Images.length) {
        let featured = listingItem.ItemInformation.Images.find(img => img.featured);
        if (featured === undefined) {
          featured = listingItem.ItemInformation.Images[0];
        }

        newOrder.listing.image =  parseImagePath(featured, 'MEDIUM', marketUrl) ||
                                  parseImagePath(featured, 'ORIGINAL', marketUrl) ||
                                  newOrder.listing.image;
      }

      if (isBasicObjectType(listingItem.ItemInformation.ItemLocation)) {
        itemCountry = getValueOrDefault(listingItem.ItemInformation.ItemLocation.country, 'string', itemCountry);
      }
    }

    if (isBasicObjectType(listingItem.PaymentInformation) && isBasicObjectType(listingItem.PaymentInformation.ItemPrice)) {
      const cumulAmount = new PartoshiAmount(listingItem.PaymentInformation.ItemPrice.basePrice, true);
      newOrder.pricing.basePrice = {
        whole: cumulAmount.particlStringInteger(), sep: cumulAmount.particlStringSep(), fraction: cumulAmount.particlStringFraction()
      };

      if (isBasicObjectType(listingItem.PaymentInformation.ItemPrice.ShippingPrice)) {
        const selectedAmount = itemCountry === newOrder.shippingDetails.country ?
            listingItem.PaymentInformation.ItemPrice.ShippingPrice.domestic :
            listingItem.PaymentInformation.ItemPrice.ShippingPrice.international;

        const shipPrice = new PartoshiAmount(selectedAmount, true);
        newOrder.pricing.shippingPrice = {
          whole: shipPrice.particlStringInteger(), sep: shipPrice.particlStringSep(), fraction: shipPrice.particlStringFraction()
        };
        cumulAmount.add(shipPrice);
      }

      newOrder.pricing.subTotal = {
        whole: cumulAmount.particlStringInteger(), sep: cumulAmount.particlStringSep(), fraction: cumulAmount.particlStringFraction()
      };

      const escrowAmount = new PartoshiAmount(cumulAmount.particls());

      if (isBasicObjectType(listingItem.PaymentInformation.Escrow)) {
        buyflowType = getValueOrDefault(listingItem.PaymentInformation.Escrow.type, 'string', buyflowType);

        if (isBasicObjectType(listingItem.PaymentInformation.Escrow.Ratio)) {
          let percent = itemViewer === 'SELLER' ?
              listingItem.PaymentInformation.Escrow.Ratio.seller :
              listingItem.PaymentInformation.Escrow.Ratio.buyer;

          if (!(+percent > 0)) {
            percent = 100;
          }

          escrowAmount.multiply(percent / 100);
        }
      }

      newOrder.pricing.escrowAmount = {
        whole: escrowAmount.particlStringInteger(), sep: escrowAmount.particlStringSep(), fraction: escrowAmount.particlStringFraction()
      };

      const totalAmount = itemViewer === 'SELLER' ?
          escrowAmount :
          cumulAmount.add(escrowAmount);

      newOrder.pricing.totalRequired = {
        whole: totalAmount.particlStringInteger(), sep: totalAmount.particlStringSep(), fraction: totalAmount.particlStringFraction()
      };
    }

    newOrder.currentState = this.getStateDetails(buyflowType, src.OrderItems[0].status, itemViewer);

    return newOrder;
  }


  private buildBuyFlowMadCT(): BuyFlow {

    const buyflowType: BuyFlowType = 'MAD_CT';
    const states: BuyFlowStateStore = {};
    const actions: BuyFlowActionStore = {};

    // States:

    states[ORDER_ITEM_STATUS.CREATED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.CREATED,
      label: TextContent.STATE_CREATED_LABEL,
      order: 0,
      stateInfo: {
        buyer: TextContent.STATE_CREATED_STATUS_BUYER,
        seller: TextContent.STATE_CREATED_STATUS_SELLER
      },
      statusClass: StateStatusClass.ALERT
    };

    states[ORDER_ITEM_STATUS.REJECTED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.REJECTED,
      label: TextContent.STATE_REJECTED_LABEL,
      order: -2,
      stateInfo: {
        buyer: TextContent.STATE_REJECTED_STATUS_BUYER,
        seller: TextContent.STATE_REJECTED_STATUS_SELLER
      },
      statusClass: StateStatusClass.INACTIVE
    };

    states[ORDER_ITEM_STATUS.CANCELLED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.CANCELLED,
      label: TextContent.STATE_CANCELLED_LABEL,
      order: -1,
      stateInfo: {
        buyer: TextContent.STATE_CANCELLED_STATUS_BUYER,
        seller: TextContent.STATE_CANCELLED_STATUS_SELLER
      },
      statusClass: StateStatusClass.INACTIVE
    };

    states[ORDER_ITEM_STATUS.ACCEPTED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.ACCEPTED,
      label: TextContent.STATE_ACCEPTED_LABEL,
      order: 1,
      stateInfo: {
        buyer: TextContent.STATE_ACCEPTED_STATUS_BUYER,
        seller: TextContent.STATE_ACCEPTED_STATUS_SELLER
      },
      statusClass: StateStatusClass.WARNING_OTHER
    };

    states[ORDER_ITEM_STATUS.ESCROW_REQUESTED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.ESCROW_REQUESTED,
      label: TextContent.STATE_ESCROW_LOCKED_LABEL,
      order: 2,
      stateInfo: {
        buyer: TextContent.STATE_ESCROW_LOCKED_STATUS_BUYER,
        seller: TextContent.STATE_ESCROW_LOCKED_STATUS_SELLER
      },
      statusClass: StateStatusClass.WARNING
    };

    states[ORDER_ITEM_STATUS.ESCROW_COMPLETED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.ESCROW_COMPLETED,
      label: TextContent.STATE_ESCROW_COMPLETED_LABEL,
      order: 3,
      stateInfo: {
        buyer: TextContent.STATE_ESCROW_COMPLETED_STATUS_BUYER,
        seller: TextContent.STATE_ESCROW_COMPLETED_STATUS_SELLER
      },
      statusClass: StateStatusClass.PRIMARY
    };

    states[ORDER_ITEM_STATUS.SHIPPED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.SHIPPED,
      label: TextContent.STATE_SHIPPED_LABEL,
      order: 4,
      stateInfo: {
        buyer: TextContent.STATE_SHIPPED_STATUS_BUYER,
        seller: TextContent.STATE_SHIPPED_STATUS_SELLER
      },
      statusClass: StateStatusClass.SECONDARY
    };

    states[ORDER_ITEM_STATUS.COMPLETE] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.COMPLETE,
      label: TextContent.STATE_COMPLETE_LABEL,
      order: 5,
      stateInfo: {
        buyer: TextContent.STATE_COMPLETE_STATUS_BUYER,
        seller: TextContent.STATE_COMPLETE_STATUS_SELLER
      },
      statusClass: StateStatusClass.TERTIARY
    };


    // Actions (the edges between states):

    actions[ORDER_ITEM_STATUS.CREATED] = [
      {
        fromState: ORDER_ITEM_STATUS.CREATED,
        toState: ORDER_ITEM_STATUS.ACCEPTED,
        user: 'SELLER',
        actionType: 'PRIMARY',
        details: {
          label: TextContent.ACTION_ACCEPT_LABEL, tooltip: TextContent.ACTION_ACCEPT_TOOLTIP, colour: 'primary', icon: 'part-check'
        },
        transition: this.actionBidAccept.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.CREATED,
        toState: ORDER_ITEM_STATUS.REJECTED,
        user: 'SELLER',
        actionType: 'PRIMARY',
        details: {
          label: TextContent.ACTION_REJECT_LABEL, tooltip: TextContent.ACTION_REJECT_TOOLTIP, colour: 'warn', icon: 'part-cross'
        },
        transition: this.actionBidReject.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.CREATED,
        toState: ORDER_ITEM_STATUS.CANCELLED,
        user: 'BUYER',
        actionType: 'ALTERNATIVE',
        details: {
          label: TextContent.ACTION_CANCEL_LABEL, tooltip: TextContent.ACTION_CANCEL_TOOLTIP, colour: 'warn', icon: 'part-cross'
        },
        transition: this.actionBidCancel.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.CREATED,
        toState: null,
        user: 'BUYER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_WAITING_FOR_SELLER, tooltip: '', colour: 'primary', icon: 'part-date'
        },
        transition: this.actionInvalid.bind(this)
      }
    ];

    actions[ORDER_ITEM_STATUS.ACCEPTED] = [
      {
        fromState: ORDER_ITEM_STATUS.ACCEPTED,
        toState: ORDER_ITEM_STATUS.CANCELLED,
        user: 'SELLER',
        actionType: 'ALTERNATIVE',
        details: {
          label: TextContent.ACTION_CANCEL_LABEL, tooltip: TextContent.ACTION_CANCEL_TOOLTIP, colour: 'warn', icon: 'part-cross'
        },
        transition: this.actionBidCancel.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.ACCEPTED,
        toState: null,
        user: 'SELLER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_ESCROW_PENDING, tooltip: TextContent.PLACEHOLDER_ESCROW_PENDING_TOOLTIP, colour: 'primary', icon: 'part-date'
        },
        transition: this.actionInvalid.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.ACCEPTED,
        toState: ORDER_ITEM_STATUS.CANCELLED,
        user: 'BUYER',
        actionType: 'ALTERNATIVE',
        details: {
          label: TextContent.ACTION_CANCEL_LABEL, tooltip: TextContent.ACTION_CANCEL_TOOLTIP, colour: 'warn', icon: 'part-cross'
        },
        transition: this.actionBidCancel.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.ACCEPTED,
        toState: ORDER_ITEM_STATUS.ESCROW_REQUESTED,
        user: 'BUYER',
        actionType: 'PRIMARY',
        details: {
          label: TextContent.ACTION_REQUEST_ESCROW_LABEL, tooltip: TextContent.ACTION_REQUEST_ESCROW_TOOLTIP, colour: 'primary', icon: 'part-check'
        },
        transition: this.actionBidEscrowLock.bind(this)
      }
    ];
    actions[ORDER_ITEM_STATUS.ESCROW_REQUESTED] = [
      {
        fromState: ORDER_ITEM_STATUS.ESCROW_REQUESTED,
        toState: ORDER_ITEM_STATUS.CANCELLED,
        user: 'SELLER',
        actionType: 'ALTERNATIVE',
        details: {
          label: TextContent.ACTION_CANCEL_LABEL, tooltip: TextContent.ACTION_CANCEL_TOOLTIP, colour: 'warn', icon: 'part-cross'
        },
        transition: this.actionBidCancel.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.ESCROW_REQUESTED,
        toState: ORDER_ITEM_STATUS.ESCROW_COMPLETED,
        user: 'SELLER',
        actionType: 'PRIMARY',
        details: {
          label: TextContent.ACTION_COMPLETE_ESCROW_LABEL, tooltip: TextContent.ACTION_COMPLETE_ESCROW_TOOLTIP, colour: 'primary', icon: 'part-check'
        },
        transition: this.actionBidEscrowComplete.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.ESCROW_REQUESTED,
        toState: ORDER_ITEM_STATUS.CANCELLED,
        user: 'BUYER',
        actionType: 'ALTERNATIVE',
        details: {
          label: TextContent.ACTION_CANCEL_LABEL, tooltip: TextContent.ACTION_CANCEL_TOOLTIP, colour: 'warn', icon: 'part-cross'
        },
        transition: this.actionBidCancel.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.ESCROW_REQUESTED,
        toState: null,
        user: 'BUYER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_WAITING_FOR_SELLER, tooltip: '', colour: 'primary', icon: 'part-date'
        },
        transition: this.actionInvalid.bind(this)
      }
    ];
    actions[ORDER_ITEM_STATUS.ESCROW_COMPLETED] = [
      {
        fromState: ORDER_ITEM_STATUS.ESCROW_COMPLETED,
        toState: ORDER_ITEM_STATUS.SHIPPED,
        user: 'SELLER',
        actionType: 'PRIMARY',
        details: {
          label: TextContent.ACTION_SHIP_LABEL, tooltip: TextContent.ACTION_SHIP_TOOLTIP, colour: 'primary', icon: 'part-check'
        },
        transition: this.actionOrderShip.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.ESCROW_COMPLETED,
        toState: null,
        user: 'BUYER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_WAITING_FOR_SELLER, tooltip: TextContent.PLACEHOLDER_SHIPPING_PENDING_TOOLTIP,
          colour: 'primary', icon: 'part-date'
        },
        transition: this.actionInvalid.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.ESCROW_COMPLETED,
        toState: ORDER_ITEM_STATUS.COMPLETE,
        user: 'BUYER',
        actionType: 'PRIMARY',
        details: {
          label: TextContent.ACTION_COMPLETE_LABEL, tooltip: TextContent.ACTION_COMPLETE_TOOLTIP, colour: 'primary', icon: 'part-check'
        },
        transition: this.actionOrderComplete.bind(this)
      }
    ];
    actions[ORDER_ITEM_STATUS.SHIPPED] = [
      {
        fromState: ORDER_ITEM_STATUS.SHIPPED,
        toState: null,
        user: 'SELLER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_DELIVERY_PENDING, tooltip: TextContent.PLACEHOLDER_DELIVERY_PENDING_TOOLTIP,
          colour: 'primary', icon: 'part-date'
        },
        transition: this.actionInvalid.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.SHIPPED,
        toState: ORDER_ITEM_STATUS.COMPLETE,
        user: 'BUYER',
        actionType: 'PRIMARY',
        details: {
          label: TextContent.ACTION_COMPLETE_LABEL, tooltip: TextContent.ACTION_COMPLETE_TOOLTIP, colour: 'primary', icon: 'part-check'
        },
        transition: this.actionOrderComplete.bind(this)
      }
    ];
    actions[ORDER_ITEM_STATUS.COMPLETE] = [
      {
        fromState: ORDER_ITEM_STATUS.COMPLETE,
        toState: null,
        user: 'SELLER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_ORDER_COMPLETE, tooltip: '', colour: 'primary', icon: 'part-check'
        },
        transition: this.actionInvalid.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.COMPLETE,
        toState: null,
        user: 'BUYER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_ORDER_COMPLETE, tooltip: '', colour: 'primary', icon: 'part-check'
        },
        transition: this.actionInvalid.bind(this)
      },
    ];
    actions[ORDER_ITEM_STATUS.REJECTED] = [
      {
        fromState: ORDER_ITEM_STATUS.REJECTED,
        toState: null,
        user: 'SELLER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_REJECTED, tooltip: '', colour: 'primary', icon: 'part-error'
        },
        transition: this.actionInvalid.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.REJECTED,
        toState: null,
        user: 'BUYER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_REJECTED, tooltip: '', colour: 'primary', icon: 'part-error'
        },
        transition: this.actionInvalid.bind(this)
      }
    ];
    actions[ORDER_ITEM_STATUS.CANCELLED] = [
      {
        fromState: ORDER_ITEM_STATUS.CANCELLED,
        toState: null,
        user: 'SELLER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_CANCELLED, tooltip: '', colour: 'primary', icon: 'part-error'
        },
        transition: this.actionInvalid.bind(this)
      },
      {
        fromState: ORDER_ITEM_STATUS.CANCELLED,
        toState: null,
        user: 'BUYER',
        actionType: 'PLACEHOLDER_LABEL',
        details: {
          label: TextContent.PLACEHOLDER_CANCELLED, tooltip: '', colour: 'primary', icon: 'part-error'
        },
        transition: this.actionInvalid.bind(this)
      }
    ];

    return { states, actions };
  }


  private buildBuyflowUnsupported(): BuyFlow {
    const states: BuyFlowStateStore = {
      UNKNOWN: {
        buyflow: 'UNSUPPORTED',
        stateId: 'UNKNOWN',
        order: 0,
        label: TextContent.STATE_INVALID_LABEL,
        filterLabel: TextContent.STATE_INVALID_LABEL,
        stateInfo: {
          buyer: TextContent.STATE_INVALID_STATUSTEXT,
          seller: TextContent.STATE_INVALID_STATUSTEXT,
        },
        statusClass: StateStatusClass.NONE
      }
    };

    return { states, actions: {} };
  }
}
