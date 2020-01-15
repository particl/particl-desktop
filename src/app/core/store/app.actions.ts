import { CoreConnectionModel, APP_MODE, NetworkInfoModel, ActiveWalletInfoModel } from './app.models';

export namespace Global {

  export class Connected {
    static readonly type: string = '[Application] Connected';
    constructor(public config: CoreConnectionModel) {}
  }

  export class SetLoadingMessage {
    static readonly type: string = '[Application] Set Loading Message';
    constructor(public message: string) {}
  }

  export class ChangeMode {
    static readonly type: string = '[Application] Change App Mode';
    constructor(public mode: APP_MODE | null) {}
  }
}


export namespace AppSettings {

  export class SetSetting {
    static readonly type: string = '[AppSettings] Set Setting';
    constructor(public setting: string, public value: string | boolean | number) {}
  }
}


export namespace AppData {

  export class SetActiveWalletInfo {
    static readonly type: string = '[AppData] Set Active Wallet Info';
    constructor(public walletinfo: ActiveWalletInfoModel) {}
  }

  export class SetNetworkInfo {
    static readonly type: string = '[AppData] Set NetworkInfo';
    constructor(public network: NetworkInfoModel) {}
  }

}
