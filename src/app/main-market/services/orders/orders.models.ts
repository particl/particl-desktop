import { Observable } from 'rxjs';
import { PriceItem, ORDER_ITEM_STATUS, ESCROW_TYPE, BID_DATA_KEY, BID_STATUS } from '../../shared/market.models';


export const messageListeners = {
  sellerAll: ['MPA_BID_03', 'MPA_CANCEL_03', 'MPA_LOCK_03', 'MPA_RELEASE'],
  sellerAlerts: ['MPA_BID_03', 'MPA_LOCK_03'],
  buyerAll: ['MPA_REJECT_03', 'MPA_CANCEL_03', 'MPA_ACCEPT_03', 'MPA_COMPLETE', 'MPA_SHIP'],
  buyerAlerts: ['MPA_ACCEPT_03', 'MPA_SHIP'],
};


export interface GenericOrderModalInputs {
  orderItem: OrderItem;
}


export interface OrderModalResponse {
  doAction: boolean;
  params: ActionTransitionParams;
}


export interface OrderItem {
  orderId: number;
  orderItemId: number;
  orderHash: string;
  orderHashShort: string;
  baseBidId: number;
  latestBidHash: string;
  marketKey: string;
  created: number;
  updated: number;
  listing?: {
    title: string;
    image: string;
    id: number;
    hash: string;
  };
  pricing?: {
    basePrice: PriceItem;
    shippingPrice: PriceItem;
    subTotal: PriceItem;
    escrowAmount: PriceItem;
    totalRequired: PriceItem;
  };
  escrow?: {
    buyerPercentage: number;
    sellerPercentage: number;
    isRecommendedDefault: boolean;
  };
  shippingDetails?: {
    name: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    code: string;
    country: string;
  };
  contactDetails?: {
    phone: string;
    email: string;
  };
  currentState?: BuyflowStateDetails;
  extraDetails?: {
    escrowMemo: string;
    shippingMemo: string;
    releaseMemo: string;
    escrowTxn: string;
    releaseTxn: string;
    rejectionReason: string;
    wasPreviouslyCancelled: boolean;
    msgId: string;
  };
  hasWarnings: boolean;
}


export type OrderUserType = 'BUYER' | 'SELLER';

export type BuyFlowType = ESCROW_TYPE | 'UNSUPPORTED';

export type BuyFlowOrderType = ORDER_ITEM_STATUS | 'UNKNOWN';

export enum StateStatusClass {
  NONE = '',
  PRIMARY = 'color-primary',
  SECONDARY = 'color-secondary',
  TERTIARY = 'color-tertiary',
  ALERT = 'color-alert',
  WARNING = 'color-warning',
  WARNING_OTHER = 'color-warning-alt',
  INACTIVE = 'color-inactive'
}


// We're not creating a state machine for each and every order. Instead, we create a single state machine for each buyflow type,
//  and then provides methods to lookup the current state ad actions, for each order. More like a workflow than a state machine...
export interface IBuyflowController {
  getOrderedStateList(buyflow: BuyFlowType): BuyFlowState[];
  getStateDetails(buyflow: BuyFlowType, stateId: BuyFlowOrderType, user: OrderUserType): BuyflowStateDetails;
  actionOrderItem(orderItem: OrderItem, toState: BuyFlowOrderType, asUser: OrderUserType): Observable<OrderItem>;
}

export type BuyFlowStore = {
  [buyflow in BuyFlowType]?: BuyFlow;
};

export interface BuyFlow {
  states: BuyFlowStateStore;
  actions: BuyFlowActionStore;
}

export type BuyFlowStateStore = {
  [state in BuyFlowOrderType]?: BuyFlowState
};

export interface BuyFlowState {
  buyflow: BuyFlowType;
  stateId: BuyFlowOrderType;
  mappedBidStatus: BID_STATUS;
  label: string;
  filterLabel?: string;
  order: number;
  stateInfo: {
    buyer: string;
    seller: string;
  };
  statusClass: StateStatusClass;
  isFinalState: boolean;
}

type BuyflowActionType = 'PRIMARY' | 'ALTERNATIVE' | 'PLACEHOLDER_LABEL';

export type ActionTransitionParams = {
  [key in BID_DATA_KEY.DELIVERY_EMAIL | BID_DATA_KEY.DELIVERY_PHONE | 'memo']?: string;
};

export type BuyFlowActionStore = {
  [fromState in BuyFlowOrderType]?: BuyflowAction[];
};

export interface BuyflowAction {
  fromState: BuyFlowOrderType;
  toState: BuyFlowOrderType | null;
  user: OrderUserType;
  actionType: BuyflowActionType;
  details: {
    label: string;
    tooltip: string;
    colour: 'primary' | 'warn';
    icon: string;
  };
  transition(orderItem: OrderItem, extraParams: ActionTransitionParams): Observable<boolean>;
}


export interface BuyflowStateDetails {
  state: BuyFlowState;
  actions: { [actionType in BuyflowActionType]: BuyflowAction[] };
}
