import {
  APP_MODE,
  CoreConnectionModel,
  NetworkInfoModel,
  AppVersionsModel,
  RpcPeerInfoModel,
} from './app.models';

export namespace Global {
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

  export class SetPeerInfo {
    static readonly type: string = '[AppData] Set Peer Info';
    constructor(public peers: RpcPeerInfoModel[]) {}
  }

  export class SetNodeCurrentBlockheight {
    static readonly type: string = '[AppData] Set Node Current Blockheight';
    constructor(public count: number) {}
  }

}


export namespace ZMQ {
  export class UpdateStatus {
    static readonly type: string = '[ZMQ] Update Status';
    constructor(public action: string, public field: string, public value: any) {}
  }
}
