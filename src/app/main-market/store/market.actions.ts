import { Identity } from './market.models';
import { Market } from '../services/data/data.models';


export namespace MarketActions {

  export class StartMarketService {
    static readonly type: string = '[Market] Start Market Service';
  }

  export class StopMarketService {
    static readonly type: string = '[Market] Stop Market Service';
  }


  export class RestartMarketService {
    static readonly type: string = '[Market] Restart Market Service';
  }

  export class LoadIdentities {
    static readonly type: string = '[Market] Load Identities';
  }

  export class SetCurrentIdentity {
    static readonly type: string = '[Market] Set Current Identity';
    constructor(public identity: Identity) {}
  }

  export class CreateIdentity {
    static readonly type: string = '[Market] Create Identity';
    constructor(public identityName: string) {}
  }

  export class AddIdentityMarket {
    static readonly type: string = '[Market] Add Identity Market';
    constructor(public market: Market) {}
  }

  export class SetSetting {
    static readonly type: string = '[Market] Save Market Setting';
    constructor(public key: string, public value: string | boolean | number) {}
  }

  export class StartNotifications {
    static readonly type: string = '[Market] Start Notifications';
    constructor(public marketReceiveKeys: string[]) {}
  }

}
