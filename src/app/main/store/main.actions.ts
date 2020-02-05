
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
    /**
     * Request an update of the base wallet model data only:
     *  specifically for determining updates to the wallet intialization, encryption statuses, for example.
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

}
