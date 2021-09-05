import { PublicUTXO } from 'app/main/store/main.models';
import { PartoshiAmount } from 'app/core/util/utils';


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


export type ZapGroupDetailsType = Map<string, {total: PartoshiAmount, utxos: PublicUTXO[]}>;


export interface ColdStakingDetails {
  spendAddress: string;
  stakeAddress: string;
}


export interface SelectedInputs {
  utxos: {tx: string; n: number}[];
  value: number;
}


export interface RpcWalletsettingsChangeaddress {
  changeaddress?: {
    coldstakingaddress: string
  };
}



export interface RpcExtkeyAccount {
  type: string;                                     // eg: "Account"
  active: 'true' | 'false';
  label: string;
  default_account: 'true' | 'false';
  created_at: number;
  id: string;                                       // eg: "aUyr52Vi9oMNXYuf8enk4zkwTeC6GBMj7M",
  has_secret: 'true' | 'false';
  encrypted: 'true' | 'false';
  root_key_id: string;                              // eg: "xPXNZLeVEtaWen3X5vED4JA9VhvsikigYj",
  path: string;                                     // eg: "m/0h",
  chains: {
    function?: 'active_external' | 'active_internal' | 'active_stealth';
    id: string;                                     // eg: "xNAdQKBRq1rbLPVjMhsWwoPrNSXMqdxaVt"
    chain: string;                                  // eg: "pparszMYp2SyZfGqV2bAEv5euGKjj7D8JtseV..."
    label: string;
    active: 'true' | 'false';
    receive_on: 'true' | 'false';
    use_type?: 'internal' | 'external' | 'stealth' | 'confidential';
    num_derives: string;                            // eg: "23",
    num_derives_h: string;                          // eg: "0"
    path: string;                                   // eg: "m/0h/0"
  }[];
}


export type RpcListaddressgroupings = [ string, number, string?, ][][];
