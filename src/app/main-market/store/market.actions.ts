import { Identity } from './market.models';
import { Market } from '../services/data/data.models';
import { OrderUserType } from '../services/orders/orders.models';


export namespace MarketStateActions {

  export class StartMarketService {
    static readonly type: string = '[Market State] Start Market Service';
  }

  export class StopMarketService {
    static readonly type: string = '[Market State] Stop Market Service';
  }


  export class RestartMarketService {
    static readonly type: string = '[Market State] Restart Market Service';
  }

  export class LoadIdentities {
    static readonly type: string = '[Market State] Load Identities';
  }

  export class SetCurrentIdentity {
    static readonly type: string = '[Market State] Set Current Identity';
    constructor(public identity: Identity) {}
  }

  export class SetIdentityCartCount {
    static readonly type: string = '[Market State] Set Identity Cart Count';
  }

}

export namespace MarketUserActions {

  export class SetSetting {
    static readonly type: string = '[Market User] Save Market Setting';
    constructor(public key: string, public value: string | boolean | number) {}
  }

  export class CreateIdentity {
    static readonly type: string = '[Market User] Create Identity';
    constructor(public identityName: string) {}
  }

  export class AddIdentityMarket {
    static readonly type: string = '[Market User] Add Identity Market';
    constructor(public market: Market) {}
  }

  export class RemoveIdentityMarket {
    static readonly type: string = '[Market User] Remove Identity Market';
    constructor(public identityId: number, public marketId: number) {}
  }

  export class CartItemAdded {
    static readonly type: string = '[Market] User Add Cart Item';
    constructor(public identityId: number, public cartId: number) {}
  }

  export class CartItemRemoved {
    static readonly type: string = '[Market User] Remove Cart Item';
    constructor(public identityId: number, public cartId: number) {}
  }

  export class CartCleared {
    static readonly type: string = '[Market User] Remove All Cart Items';
    constructor(public identityId: number) {}
  }

  export class AddOrdersPendingAction {
    static readonly type: string = '[Market User] Add Orders Pending Action';
    constructor(public identityId: number, public orderType: OrderUserType, public orderHashes: string[]) {}
  }

  export class OrderItemActioned {
    static readonly type: string = '[Market User] Action Order Item';
    constructor(public orderType: OrderUserType, public orderHash: string) {}
  }

  export class OrderItemsCleared {
    static readonly type: string = '[Market User] Remove All Pending Order Items';
  }
}
