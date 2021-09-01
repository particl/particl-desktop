
export interface RpcWalletSettingsChangeAddress {
  changeaddress?: {
    coldstakingaddress: string
  };
}


export interface RpcColdStakingEnabled {
  changeaddress: {
    coldstakingaddress: string;
    time: number
  };
}


export interface RpcColdStakingDisabled {
  changeaddress: 'cleared';
}


export enum ZapStakingStrategy {
  PRIVACY,
  STAKING,
}
