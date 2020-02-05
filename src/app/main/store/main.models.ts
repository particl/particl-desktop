
export interface WalletInfoStateModel {
  walletname: string;
  walletversion: number;
  encryptionstatus: string;
  unlocked_until: number;
  hdseedid: string;
  private_keys_enabled: boolean;
}


export interface WalletStakingStateModel {
  cold_staking_enabled: boolean;
}


export interface MainStateModel {
  isInitialized: boolean;
}


export interface RpcGetColdStakingInfo {
  enabled: boolean;
  coin_in_stakeable_script: number;
  coin_in_coldstakeable_script: number;
  percent_in_coldstakeable_script: number;
  currently_staking: number;
}


export interface RpcGetWalletInfo {
  walletname: string,
  walletversion: number,
  total_balance: number,
  balance: number,
  blind_balance: number,
  anon_balance: number,
  staked_balance: number,
  unconfirmed_balance: number,
  unconfirmed_blind: number,
  unconfirmed_anon: number,
  immature_balance: number,
  immature_anon_balance: number,
  txcount: number,
  keypoololdest: number,
  keypoolsize: number,
  reserve: number,
  encryptionstatus: string,
  unlocked_until: number,
  paytxfee: number,
  hdseedid: string,
  private_keys_enabled: boolean
}
