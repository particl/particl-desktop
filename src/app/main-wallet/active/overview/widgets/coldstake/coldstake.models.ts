import { PublicUTXO, RPCResponses } from 'app/networks/particl/particl.models';
import { PartoshiAmount } from 'app/core/util/utils';


export interface RpcColdStakingEnabled extends RPCResponses.WalletSettings.ChangeAddress {
  changeaddress: {
    coldstakingaddress: string;
    time: number
  };
}


export interface RpcColdStakingDisabled extends RPCResponses.WalletSettings.ChangeAddress {
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
