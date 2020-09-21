import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { MarketRpcService } from '../market-rpc/market-rpc.service';
import { RegionListService } from '../region-list/region-list.service';

import { PartoshiAmount } from 'app/core/util/utils';
import { getValueOrDefault, isBasicObjectType, parseImagePath } from '../../shared/utils';
import { BID_DATA_KEY, ORDER_ITEM_STATUS, RespOrderSearchItem, ESCROW_TYPE } from '../../shared/market.models';
import {
  OrderItem,
  AAIBuyflowController,
  AABuyFlow,
  ORDER_USER_TYPE,
  AABuyFlowDetails,
  FLOW,
  FLOW_ORDER_STATUS,
  AABuyFlowStates,
  AABuyFlowActions,
  AAUsableStateDetails,
  AABuyFlowState
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

  STATE_ESCROW_LOCKED_LABEL = 'Escrow Pending',
  STATE_ESCROW_LOCKED_STATUS_BUYER = 'Waiting on seller to complete the escrow',
  STATE_ESCROW_LOCKED_STATUS_SELLER = 'Buyer has requested escrow - please proceed to completing your escrow payment (this will lock the funds to escrow)',

  STATE_ESCROW_COMPLETED_LABEL = 'Packaging',
  STATE_ESCROW_COMPLETED_STATUS_BUYER = 'Funds locked in escrow, waiting for Seller to process order for shipping',
  STATE_ESCROW_COMPLETED_STATUS_SELLER = 'Order is ready to ship - when sent, mark order as shipped and await its delivery',

  STATE_SHIPPED_LABEL = 'Shipping',
  STATE_SHIPPED_STATUS_BUYER = 'Order has been shipped - when you receive it, mark it as delivered and the escrow funds will be released',
  STATE_SHIPPED_STATUS_SELLER = 'Order sent to buyer, waiting for buyer to confirm the delivery',

  STATE_COMPLETE_LABEL = 'Complete',
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
  PLACEHOLDER_DELIVERY_PENDING_TOOLTIP = 'Awaiting confirmation of successfull delivery by Buyer',
  PLACEHOLDER_ORDER_COMPLETE = 'Order complete',
}


@Injectable()
export class BidOrderService implements AAIBuyflowController {

  private defaultMarketImage: string;
  private buyflows: AABuyFlow = {
    UNSUPPORTED: this.buildBuyflowUnsupported(),
    MAD_CT: this.buildBuyFlowMadCT()
  };


  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
    private _regionService: RegionListService
  ) {

    this.defaultMarketImage = this._store.selectSnapshot(MarketState.defaultConfig).imagePath;
  }


  fetchBids(userType: ORDER_USER_TYPE): Observable<OrderItem[]> {
    const identity = this._store.selectSnapshot(MarketState.currentIdentity);
    const marketUrl = this._store.selectSnapshot(MarketState.defaultConfig).url;
    const userQuery = [
      userType === 'BUYER' ? identity.address : null,
      userType === 'SELLER' ? identity.address : null
    ];
    return this._rpc.call('order', ['search', 0, 1_000_000, 'DESC', 'created_at', null, null, ...userQuery]).pipe(
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


  getOrderedStateList(buyflow: FLOW): AABuyFlowState[] {
    const selectedBuyflow = isBasicObjectType(this.buyflows[buyflow]) ? this.buyflows[buyflow] : this.buyflows.UNSUPPORTED;
    const states = Object.values(selectedBuyflow.states);

    return [
      ...states.filter(s => s.order >= 0).sort((a, b) => a.order - b.order),
      ...states.filter(s => s.order < 0).sort((a, b) => b.order - a.order)
    ];
  }


  getStateDetails(buyflow: FLOW, stateId: FLOW_ORDER_STATUS, user: ORDER_USER_TYPE): AAUsableStateDetails {
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


  actionOrderItem(orderItem: OrderItem, toState: FLOW_ORDER_STATUS, asUser: ORDER_USER_TYPE): Observable<OrderItem> {
    // TODO: Implement this
    return throwError(() => of('NOT IMPLEMENTED'));
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

    if (!(newOrder.orderId > 0) || !(newOrder.orderItemId > 0) || !(newOrder.baseBidId > 0)) {
      return newOrder;
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

    const itemViewer: ORDER_USER_TYPE = +listingItem.listingItemTemplateId > 0 ? 'SELLER' : 'BUYER';

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

        newOrder.listing.image = parseImagePath(featured, 'MEDIUM', marketUrl) || newOrder.listing.image;
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


  private buildBuyFlowMadCT(): AABuyFlowDetails {

    const buyflowType: FLOW = 'MAD_CT';
    const states: AABuyFlowStates = {};
    const actions: AABuyFlowActions = {};

    states[ORDER_ITEM_STATUS.CREATED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.CREATED,
      label: TextContent.STATE_CREATED_LABEL,
      order: 0,
      stateInfo: {
        buyer: TextContent.STATE_CREATED_STATUS_BUYER,
        seller: TextContent.STATE_CREATED_STATUS_SELLER
      }
    };

    states[ORDER_ITEM_STATUS.REJECTED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.REJECTED,
      label: TextContent.STATE_CREATED_LABEL,
      order: -1,
      stateInfo: {
        buyer: TextContent.STATE_REJECTED_STATUS_BUYER,
        seller: TextContent.STATE_REJECTED_STATUS_SELLER
      }
    };

    states[ORDER_ITEM_STATUS.CANCELLED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.CANCELLED,
      label: TextContent.STATE_CANCELLED_LABEL,
      order: -2,
      stateInfo: {
        buyer: TextContent.STATE_CANCELLED_STATUS_BUYER,
        seller: TextContent.STATE_CANCELLED_STATUS_SELLER
      }
    };

    states[ORDER_ITEM_STATUS.ACCEPTED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.ACCEPTED,
      label: TextContent.STATE_ACCEPTED_LABEL,
      order: 1,
      stateInfo: {
        buyer: TextContent.STATE_ACCEPTED_STATUS_BUYER,
        seller: TextContent.STATE_ACCEPTED_STATUS_SELLER
      }
    };

    states[ORDER_ITEM_STATUS.ESCROW_REQUESTED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.ESCROW_REQUESTED,
      label: TextContent.STATE_ESCROW_LOCKED_LABEL,
      order: 2,
      stateInfo: {
        buyer: TextContent.STATE_ESCROW_LOCKED_STATUS_BUYER,
        seller: TextContent.STATE_ESCROW_LOCKED_STATUS_SELLER
      }
    };

    states[ORDER_ITEM_STATUS.ESCROW_COMPLETED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.ESCROW_COMPLETED,
      label: TextContent.STATE_ESCROW_COMPLETED_LABEL,
      order: 3,
      stateInfo: {
        buyer: TextContent.STATE_ESCROW_COMPLETED_STATUS_BUYER,
        seller: TextContent.STATE_ESCROW_COMPLETED_STATUS_SELLER
      }
    };

    states[ORDER_ITEM_STATUS.SHIPPED] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.SHIPPED,
      label: TextContent.STATE_SHIPPED_LABEL,
      order: 4,
      stateInfo: {
        buyer: TextContent.STATE_SHIPPED_STATUS_BUYER,
        seller: TextContent.STATE_SHIPPED_STATUS_SELLER
      }
    };

    states[ORDER_ITEM_STATUS.COMPLETE] = {
      buyflow: buyflowType,
      stateId: ORDER_ITEM_STATUS.COMPLETE,
      label: TextContent.STATE_COMPLETE_LABEL,
      order: 5,
      stateInfo: {
        buyer: TextContent.STATE_COMPLETE_STATUS_BUYER,
        seller: TextContent.STATE_COMPLETE_STATUS_SELLER
      }
    };


    // TODO: IMPLEMENT ACTIONS
    actions[ORDER_ITEM_STATUS.CREATED] = [
      {
        fromState: ORDER_ITEM_STATUS.CREATED, toState: ORDER_ITEM_STATUS.ACCEPTED, user: 'SELLER', actionType: 'PRIMARY', details: {
          label: TextContent.ACTION_ACCEPT_LABEL, tooltip: TextContent.ACTION_ACCEPT_TOOLTIP, colour: 'primary', icon: 'part-check'
        }
      },
      {
        fromState: ORDER_ITEM_STATUS.CREATED, toState: ORDER_ITEM_STATUS.REJECTED, user: 'SELLER', actionType: 'PRIMARY', details: {
          label: TextContent.ACTION_REJECT_LABEL, tooltip: TextContent.ACTION_REJECT_TOOLTIP, colour: 'warn', icon: 'part-cross'
        }
      },
      {
        fromState: ORDER_ITEM_STATUS.CREATED, toState: ORDER_ITEM_STATUS.CANCELLED, user: 'BUYER', actionType: 'ALTERNATIVE', details: {
          label: TextContent.ACTION_CANCEL_LABEL, tooltip: TextContent.ACTION_CANCEL_TOOLTIP, colour: 'warn', icon: 'part-cross'
        }
      },
      {
        fromState: ORDER_ITEM_STATUS.CREATED, toState: null, user: 'BUYER', actionType: 'PLACEHOLDER_LABEL', details: {
          label: TextContent.PLACEHOLDER_WAITING_FOR_SELLER, tooltip: '', colour: 'primary', icon: 'part-date'
        }
      }
    ];
    actions[ORDER_ITEM_STATUS.ACCEPTED] = [
      {
        fromState: ORDER_ITEM_STATUS.ACCEPTED, toState: ORDER_ITEM_STATUS.CANCELLED, user: 'SELLER', actionType: 'ALTERNATIVE', details: {
          label: TextContent.ACTION_CANCEL_LABEL, tooltip: TextContent.ACTION_CANCEL_TOOLTIP, colour: 'warn', icon: 'part-cross'
        }
      },
      {
        fromState: ORDER_ITEM_STATUS.ACCEPTED, toState: null, user: 'SELLER', actionType: 'PLACEHOLDER_LABEL', details: {
          label: TextContent.PLACEHOLDER_ESCROW_PENDING, tooltip: TextContent.PLACEHOLDER_ESCROW_PENDING_TOOLTIP, colour: 'primary', icon: 'part-date'
        }
      },
      {
        fromState: ORDER_ITEM_STATUS.ACCEPTED, toState: ORDER_ITEM_STATUS.CANCELLED, user: 'BUYER', actionType: 'ALTERNATIVE', details: {
          label: TextContent.ACTION_CANCEL_LABEL, tooltip: TextContent.ACTION_CANCEL_TOOLTIP, colour: 'warn', icon: 'part-cross'
        }
      },
      {
        fromState: ORDER_ITEM_STATUS.ACCEPTED, toState: ORDER_ITEM_STATUS.ESCROW_REQUESTED, user: 'BUYER', actionType: 'PRIMARY', details: {
          label: TextContent.ACTION_REQUEST_ESCROW_LABEL, tooltip: TextContent.ACTION_REQUEST_ESCROW_TOOLTIP, colour: 'primary', icon: 'part-check'
        }
      }
    ];
    actions[ORDER_ITEM_STATUS.ESCROW_REQUESTED] = [];
    actions[ORDER_ITEM_STATUS.ESCROW_COMPLETED] = [];
    actions[ORDER_ITEM_STATUS.SHIPPED] = [];
    actions[ORDER_ITEM_STATUS.COMPLETE] = [];
    actions[ORDER_ITEM_STATUS.REJECTED] = [];
    actions[ORDER_ITEM_STATUS.CANCELLED] = [];

    return { states, actions };
  }


  private buildBuyflowUnsupported(): AABuyFlowDetails {
    const states: AABuyFlowStates = {
      UNKNOWN: {
        buyflow: 'UNSUPPORTED',
        stateId: 'UNKNOWN',
        order: 0,
        label: TextContent.STATE_INVALID_LABEL,
        filterLabel: TextContent.STATE_INVALID_LABEL,
        stateInfo: {
          buyer: TextContent.STATE_INVALID_STATUSTEXT,
          seller: TextContent.STATE_INVALID_STATUSTEXT,
        }
      }
    };

    return { states, actions: {} };
  }
}
