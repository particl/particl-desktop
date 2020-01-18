import {
  APP_MODE,
  CoreConnectionModel,
  NetworkInfoModel,
  AppVersionsModel
} from './app.models';

export namespace Global {


  export class ConnectionReady {
    static readonly type: string = '[Application] Connection Ready';
    constructor(public config: CoreConnectionModel) {}
  }

  export class Connected {
    static readonly type: string = '[Application] Connected';
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


  export class SetActiveWallet {
    static readonly type: string = '[AppSettings] Set Active Wallet';
    constructor(public wallet: string) {}
  }
}


export namespace AppData {

  export class SetNetworkInfo {
    static readonly type: string = '[AppData] Set NetworkInfo';
    constructor(public network: NetworkInfoModel) {}
  }

  export class SetVersionInfo {
    static readonly type: string = '[AppData] Set Version Info';
    constructor(public versions: AppVersionsModel) {}
  }

}
