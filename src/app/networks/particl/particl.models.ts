
export enum RunningStatus {
  STARTED = 1,
  STOPPED = 0,
  STARTING = 2,
  STOPPING = 3,
}


export type ChainType = 'main' | 'test' | 'regtest' | '';


export interface ParticlCoreStateModel {
  statusListening: boolean;
  running: RunningStatus;
  statusMessage: string;
  hasError: boolean;
  url: string;
  auth: string;
  zmqServices: { [key: string]: string };
}


export interface ParticlZMQStateModel {
  statusListening: boolean;
  listeners: {
    [channel: string]: null | string;
  };
}


export interface ParticlBlockchainStateModel {
  networkInfo: {
    connections: number;
    timeoffset: number;
    subversion: string;
  },
  chain: ChainType;
  peers: {address: string; blockHeight: number}[],
  currentBlockHeight: number;
}


export namespace IPCResponses {

  export namespace CoreManager {

    export namespace Events {

      export interface ParticlStatus {
        started: number,
        hasError: boolean,
        message: string,
        url: string,
        auth: string,
        zmq: { [key: string]: string },
      }

      export interface ParticlZMQ {
        status: 'data' | 'connected' | 'closed' | 'retry' | 'error';
        channel: string;
        data: undefined | unknown;
      }
    }

    // export namespace Settings {

    //   export interface Particl {
    //     core: string;
    //     request: 'update' | 'settings',
    //     response: WalletSettingsStateModel & {name: string},
    //     hasError: boolean;
    //   }
    // }
  }

}


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


// export interface WalletSettingsStateModel {
//   notifications_payment_received: boolean;
//   notifications_staking_reward: boolean;
//   utxo_split_count: number;
//   default_ringct_size: number;
// }


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
  lockedPublic: number;
  lockedBlind: number;
  lockedAnon: number;
}


export const MIN_RING_SIZE = 3;
export const MAX_RING_SIZE = 32;
export const DEFAULT_RING_SIZE = 12;
export const MIN_UTXO_SPLIT = 1;
export const MAX_UTXO_SPLIT = 100;
export const DEFAULT_UTXO_SPLIT = 1;


export const DEFAULT_PARTICL_BLOCKCHAIN_STATE: ParticlBlockchainStateModel = {
  networkInfo: {
    connections: 0,
    timeoffset: 0,
    subversion: '',
  },
  chain: '',
  peers: [],
  currentBlockHeight: 0,
};


export const DEFAULT_WALLET_STATE: WalletInfoStateModel = {
  walletname: null,
  walletversion: 0,
  encryptionstatus: '',
  unlocked_until: 0,
  hdseedid: '',
  private_keys_enabled: false,
  total_balance: 0,
  balance: 0,
  blind_balance: 0,
  anon_balance: 0,
  staked_balance: 0,
  unconfirmed_balance: 0,
  unconfirmed_blind: 0,
  unconfirmed_anon: 0,
  immature_balance: 0,
  immature_anon_balance: 0,
};


export const DEFAULT_STAKING_INFO_STATE: WalletStakingStateModel = {
  cold_staking_enabled: false,
  percent_in_coldstakeable_script: 0,
  coin_in_stakeable_script: 0,
};


export const DEFAULT_UTXOS_STATE: WalletBalanceStateModel = {
  public: [],
  blind: [],
  anon: [],
  lockedPublic: 0,
  lockedBlind: 0,
  lockedAnon: 0,
};


// export const DEFAULT_WALLET_SETTINGS_STATE: WalletSettingsStateModel = {
//   notifications_payment_received: false,
//   notifications_staking_reward: false,
//   utxo_split_count: DEFAULT_UTXO_SPLIT,
//   default_ringct_size: DEFAULT_RING_SIZE,
// };


export namespace RPCResponses {

  export interface Error {
    code: number;
    message: string;
    error?: string;
  }

  export interface GetColdStakingInfo {
    enabled: boolean;
    coin_in_stakeable_script: number;
    coin_in_coldstakeable_script: number;
    percent_in_coldstakeable_script: number;
    currently_staking: number;
  }

  export interface GetWalletInfo {
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

  export interface GetLockedBalances {
    trusted_plain: number;
    trusted_blind: number;
    trusted_anon: number;
    untrusted_plain: number;
    untrusted_blind: number;
    untrusted_anon: number;
    num_locked: number;
  }

  export interface ListWalletDir {
    wallets: {name: string}[];
  }

  export interface LoadWallet {
    name: string;
    warning: string;
  }

  export type GetPeerInfo = Array<{
    id: number;
    addr: string;
    addrlocal: string;
    addrbind: string;
    services: string;
    services_str: string;
    relaytxes: boolean;
    lastsend: number;
    lastrecv: number;
    bytessent: number;
    bytesrecv: number;
    conntime: number;
    timeoffset: number;
    pingtime: number;
    minping: number;
    version: number;
    subver: string;
    inbound: boolean;
    addnode: boolean;
    startingheight: number;
    currentheight: number;
    banscore: number;
    synced_headers: number;
    synced_blocks: number;
    duplicate_count: number;
    loose_headers: number;
    inflight?: number[];
    whitelisted: boolean;
    minfeefilter: number;
  }>

  export interface GetBlockchainInfo {
    bestblockhash: string;
    blockindexsize: number;
    blocks: number;
    chain: ChainType;
    chainwork: string;
    delayedblocks: number;
    difficulty: number;
    headers: number;
    initialblockdownload: boolean;
    mediantime: number;
    moneysupply: number;
    pruned: boolean;
    size_on_disk: number;
    verificationprogress: number;
  }
}
