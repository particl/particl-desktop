import { WalletInfoStateModel } from './main.models';


export namespace MainActions {

  export class Initialize {
    static readonly type: string = '[Main] Initialize';
    constructor(public init: boolean) {}
  }


  export class ChangeWallet {
    static readonly type: string = '[Main] Change To Wallet';
    constructor(public wallet: string) {}
  }


  export class RefreshWalletInfo {
    static readonly type: string = '[Main] Fetch Wallet Info';
  }
}
