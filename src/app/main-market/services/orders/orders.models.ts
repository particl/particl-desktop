import { Observable } from 'rxjs';
import { PriceItem, ORDER_ITEM_STATUS, ESCROW_TYPE } from '../../shared/market.models';


export interface OrderItem {
  orderId: number;
  orderItemId: number;
  orderHash: string;
  baseBidId: number;
  marketKey: string;
  created: number;
  updated: number;
  listing?: {
    title: string;
    image: string;
    id: number;
    hash: string;
    hashPrefix: string;
  };
  pricing?: {
    basePrice: PriceItem;
    shippingPrice: PriceItem;
    subTotal: PriceItem;
    escrowAmount: PriceItem;
    totalRequired: PriceItem;
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
  currentState?: AAUsableStateDetails;

  // orderDetails: {
  //   shippingMemo: string;
  //   releaseMemo: string;
  //   escrowTxn: string;
  //   releaseTxn: string;
  //   rejectionReason: string;
  //   cancelReason: string;
  // };
}


export type ORDER_USER_TYPE = 'BUYER' | 'SELLER';

export type FLOW = ESCROW_TYPE | 'UNSUPPORTED';

export type FLOW_ORDER_STATUS = ORDER_ITEM_STATUS | 'UNKNOWN';

// ------------- BEGIN TEMP -----------------

export type BuyFlowSequences = {
  [stateType in FLOW]?: Buyflow;
};

export type Buyflow = {
  [orderState in FLOW_ORDER_STATUS]?: UserState;
};

export type UserState = {
  [user in ORDER_USER_TYPE]: State
};

export interface State {
  buyflow: FLOW;
  stateId: FLOW_ORDER_STATUS;
  userType: ORDER_USER_TYPE;
  label: string;
  filterLabel?: string;
  statusText: string;
  actionsPrimary: StateActionOption[];
  actionsSecondary: StateActionOption[];
  actionsPlaceholders: StateActionOption[];
}

export interface StateActionOption {
  icon: string;
  tooltip: string;
  label: string;
}



// ------------- END TEMP -----------------

// We're not creating a state machine for each and every order. Instead, we create a single state machine for each buyflow type,
//  and then provides methods to lookup the current state ad actions, for each order. More like a workflow than a state machine...
export interface AAIBuyflowController {
  getOrderedStateList(buyflow: FLOW): AABuyFlowState[];
  getStateDetails(buyflow: FLOW, stateId: FLOW_ORDER_STATUS, user: ORDER_USER_TYPE): AAUsableStateDetails;
  actionOrderItem(orderItem: OrderItem, toState: FLOW_ORDER_STATUS, asUser: ORDER_USER_TYPE): Observable<OrderItem>;
}

export type AABuyFlow = {
  [flowType in FLOW]?: AABuyFlowDetails;
};

export interface AABuyFlowDetails {
  states: AABuyFlowStates;
  actions: AABuyFlowActions;
}

export type AABuyFlowStates = {
  [state in FLOW_ORDER_STATUS]?: AABuyFlowState
};

export type AABuyFlowActions = {
  [fromState in FLOW_ORDER_STATUS]?: AABuyflowActionable[];
};

export interface AABuyFlowState {
  buyflow: FLOW;
  stateId: FLOW_ORDER_STATUS;
  label: string;
  filterLabel?: string;
  order: number;
  stateInfo: {
    buyer: string;
    seller: string;
  };
}

type ACTIONABLE_TYPE = 'PRIMARY' | 'ALTERNATIVE' | 'PLACEHOLDER_LABEL';

export interface AABuyflowActionable {
  fromState: FLOW_ORDER_STATUS;
  toState: FLOW_ORDER_STATUS | null;
  user: ORDER_USER_TYPE;
  actionType: ACTIONABLE_TYPE;
  details: {
    label: string;
    tooltip: string;
    colour?: 'primary' | 'warn';
    icon?: string;
  };
  // TODO: include key for actual transition function
}


export interface AAUsableStateDetails {
  state: AABuyFlowState;
  actions: { [actionType in ACTIONABLE_TYPE]: AABuyflowActionable[] };
}
