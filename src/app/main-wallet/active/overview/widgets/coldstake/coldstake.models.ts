
export interface RpcWalletSettingsChangeAddress {
  changeaddress?: {
    coldstakingaddress: string
  };
}


export interface RpcUnspentTx {
  txid: string;
  vout: number;
  address?: string;
  coldstaking_address?: string;
  scriptPubKey: string;
  amount: number;
  confirmations: number;
  spendable: boolean;
  solvable: boolean;
  desc: string;
  safe: boolean;
  stakeable: boolean;
}


export interface ZapDetailUTXOModel {
  amount: number;
  address: string;
  inputs: {
    tx: string;
    n: number;
  };
}


export interface ZapDetailsModel {
  spendingAddress: string;
  coldStakingAddress: string;
  value: number;
  utxos: ZapDetailUTXOModel[];
}


export interface RpcSendTypeToZap {
  fee?: number;
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


export interface ZapInformation {
  utxos: Array<{tx: string, n: number}>;
  scriptHex: string;
  utxoAmount: number;
  fee: number;
}
