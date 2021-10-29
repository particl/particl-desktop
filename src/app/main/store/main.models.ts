

export const MIN_RING_SIZE = 3;
export const MAX_RING_SIZE = 32;
export const DEFAULT_RING_SIZE = 12;


export interface WalletInfoStateModel {
  walletname: string;
  walletversion: number;
  encryptionstatus: string;
  unlocked_until: number;
  hdseedid: string;
  private_keys_enabled: boolean;
  total_balance: number;
  balance: number;
  blind_balance: number;
  anon_balance: number;
  staked_balance: number;
  unconfirmed_balance: number;
  unconfirmed_blind: number;
  unconfirmed_anon: number;
  immature_balance: number;
  immature_anon_balance: number;
}


export interface WalletSettingsStateModel {
  notifications_payment_received: boolean;
  notifications_staking_reward: boolean;
  anon_utxo_split: number;
  public_utxo_split: number;
  default_ringct_size: number;
}


export interface WalletStakingStateModel {
  cold_staking_enabled: boolean;
  percent_in_coldstakeable_script: number;
  coin_in_stakeable_script: number;
}


export interface PublicUTXO {
  txid: string;
  vout: number;
  address?: string;
  label?: string;
  coldstaking_address?: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  spendable?: boolean;
  solvable: boolean;
  desc: string;
  safe: boolean;
  stakeable: boolean;
}


export interface BlindUTXO {
  txid: string;
  vout: number;
  address: string;
  label?: string;
  coldstaking_address?: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  safe: boolean;
  spendable?: boolean;
}


export interface AnonUTXO {
  txid: string;
  vout: number;
  address: string;
  coldstaking_address?: string;
  label: string;
  amount: number;
  confirmations: number;
  safe: boolean;
  spendable?: boolean;
}


export interface WalletBalanceStateModel {
  public: PublicUTXO[];
  blind: BlindUTXO[];
  anon: AnonUTXO[];
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
  walletname: string;
  walletversion: number;
  total_balance: number;
  balance: number;
  blind_balance: number;
  anon_balance: number;
  staked_balance: number;
  unconfirmed_balance: number;
  unconfirmed_blind: number;
  unconfirmed_anon: number;
  immature_balance: number;
  immature_anon_balance: number;
  txcount: number;
  keypoololdest: number;
  keypoolsize: number;
  reserve: number;
  encryptionstatus: string;
  unlocked_until: number;
  paytxfee: number;
  hdseedid: string;
  private_keys_enabled: boolean;
}
