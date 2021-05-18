
export namespace MainActions {

  export class Initialize {
    static readonly type: string = '[Main] Initialize';
    constructor(public init: boolean) {}
  }


  export class ChangeWallet {
    static readonly type: string = '[Main] Change To Wallet';
    constructor(public wallet: string) {}
  }


  export class ChangeSmsgWallet {
    static readonly type: string = '[Main] Change Smsg Active Wallet';
    constructor(public walletname: string) {}
  }


  export class RefreshWalletInfo {
    /**
     * Request an update of the base wallet model data only:
     *  specifically for determining updates to the wallet initialization, encryption statuses, for example.
     */
    static readonly type: string = '[Main] Refresh Wallet Info Only';
  }


  export class LoadWalletData {
    /**
     * Request an update of the supporting wallet model data only:
     *  Ideally used to load extra wallet information, eg: balance related info.
     */
    static readonly type: string = '[Main] Load Supporting Wallet Data';
  }


  export class ResetWallet {
    /**
     * Reset the active wallet state to a default blank one.
     */
    static readonly type: string = '[Main] Reset Wallet';
  }
}


export namespace WalletDetailActions {

  export class GetColdStakingInfo {
    static readonly type: string = '[Wallet Details] Get Cold Staking Info';
  }

  export class ResetStakingInfo {
    static readonly type: string = '[Wallet Details] Reset Staking Info';
  }

  export class GetAllUTXOS {
    static readonly type: string = '[Wallet Details] Get All Balances';
  }

  export class ResetAllUTXOS {
    static readonly type: string = '[Wallet Details] Reset All Balances';
  }

  export class GetSettings {
    static readonly type: string = '[Wallet Details] Load Wallet Settings';
    constructor(public walletName: string) {}
  }

  export class SetSetting {
    static readonly type: string = '[Wallet Details] Set Setting';
    constructor(public walletName: string, public key: string, public value: string | boolean | number) {}
  }

}
