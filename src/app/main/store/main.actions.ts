import { WalletInfoStateModel } from './main.models';


export namespace MainActions {

  export class Initialize {
    static readonly type: string = '[Main] Initialize';
    constructor(public init: boolean) {}
  }

  export class UpdateWalletInfo {
    static readonly type: string = '[Main] Update Wallet Info';
    constructor(public info: WalletInfoStateModel) {}
  }
}
