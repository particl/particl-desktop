
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
  version: string;
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
        version: string;
      }

      export interface ParticlZMQ {
        status: 'data' | 'connected' | 'closed' | 'retry' | 'error';
        channel: string;
        data: undefined | unknown;
      }
    }
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

  export interface ValidateAddress {
    isvalid: boolean;
    address: string;
    scriptPubKey: string;
    isscript: boolean;
    iswitness: boolean;
    witness_version?: number;
    witness_program?: string;
    isstealthaddress?: boolean;
  }

  export interface GetAddressInfo {
    address: string;
    label: string;
    scriptPubKey: string;
    ismine: boolean;
    iswatchonly: boolean;
    solvable: boolean;
    isscript: boolean;
    ischange: boolean;
    iswitness: boolean;
    witness_version?: number;
    witness_program?: string;
    script?: string;
    sigsrequired?: number;
    iscompressed?: boolean;
    hex?: string;
    pubkey?: string;
    pubkeys?: string[];
    labels?: Array<{name: string, purpose: 'send' | 'receive'}>;
    timestamp?: number;
  }

  interface ListStealthAddress {
    Account: string;
    'Stealth Addresses': [
      string,                 // Stealth address label
      string,                 // Stealth address
      string,                 // Scan secret, if show_secrets=1
      string,                 // Spend secret, if show_secrets=1
      string,                 // Scan public key, if show_secrets=1
      string,                 // Spend public key, if show_secrets=1
      // !! Additional keys occur as well!!
    ];
  }
  export type ListStealthAddresses = ListStealthAddress[];

  export type SetLabel = null;

  export type SignMessage = string;

  export type VerifyMessage = boolean;

  export type GetReceivedByAddress = number;
  export type GetNewAddress = string;
  export type GetNewStealthAddress = string;

  export interface FilterAddress {
    address: string;
    label: string;
    owned: string;
    root: string;
    path?: string;
    id?: number;
  }

  export namespace FilterAddresses {
    export type List = FilterAddress[];
    export interface Count {
      total: number;
      num_receive: number;
      num_send: number;
    };
  }

  export type AbandonTransaction = null;

  export namespace FilterTransactions {

    export type CategoryType = 'send' | 'receive' | 'stake' | 'internal_transfer' | 'orphaned_stake' | 'unknown';
    export type TransactionType = 'standard' | 'blind' | 'anon';

    export interface Output {
      stealth_address?: string;
      address?: string;
      coldstake_address?: string;
      label?: string;
      type?: TransactionType;
      amount: number;
      vout: number;
      narration?: string;
    }

    export interface Item {
      confirmations: number;
      trusted?: boolean;
      txid: string;
      time: number;
      timereceived?: number;
      fee?: number;
      reward?: number;
      requires_unlock?: boolean;
      category: CategoryType;
      abandoned?: boolean;
      outputs: Output[];
      amount: number;
      type_in?: 'anon';
    };

    export type Response = Item[];
  }

  export namespace ManageAddressBook {
    export interface NewSend {
      result: 'success' | 'failed' | '';
      action: 'newsend';
      address: string;
      label: string;
    }
  }

  export namespace Mnemonic {
    export interface DumpWords {
      words: string[];
    }

    export interface New {
      master: string;
      mnemonic: string;
    }
  }

  export type EncryptWallet = string;

  export interface CreateWallet {
    name: string;
    warning: string;
  }


  export interface GetStakingInfo {
    enabled: boolean;
    staking: boolean;
    errors: string;
    percentyearreward: number;
    moneysupply: number;
    foundationdonationpercent: number;
    currentblocksize: number;
    currentblocktx: number;
    pooledtx: number;
    difficulty: number;
    lastsearchtime: number;
    weight: number;
    netstakeweight: number;
    expectedtime: number;
  }

  export namespace WalletSettings {
    export interface ChangeAddress {
      changeaddress: 'cleared' | {
        coldstakingaddress: string;
        time: number;
      };
    }
  };

  export namespace ExtKey{
    export interface Account {
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
    };

    export interface Item {
      type: 'Loose' | 'Account';
      receive_on?: 'false' | 'true';
      active: 'false' | 'true';
      encrypted: 'false' | 'true';
      hardware_device?: 'false' | 'true';
      label: string;
      default_account?: 'true' | 'false';
      created_at?: number;
      path?: string;
      has_secret?: 'true' | 'false';
      key_type?: 'Master';
      current_master?: 'false' | 'true';
      root_key_id?: string;
      id: string;
      evkey: string;
      epkey: string;
      external_chain?: string;
      internal_chain?: string;
      num_derives?: string;
      num_derives_hardened?: string;
      num_derives_external?: string;
      num_derives_external_h?: string;
      num_derives_internal?: string;
      num_derives_internal_h?: string;
      num_derives_stealth?: string;
      num_derives_stealth_h?: string;
    }

    export interface Info {
      key_info: {
        result: string;
        path: string;
      };
    }

    export type List = Item[];

    export interface DeriveAccount {
      result: string;
      id: string;
      key_label: string;
      note: string;
      account: string;
      label: string;
      key_info: unknown;
      account_id: string;
      has_secret: string;
      account_label: string;
      scanned_from: number;
    }

    export interface Import {
      result: string;
      id: string;
      key_label: string;
      note: string;
      account: string;
      label: string;
      key_info: unknown;
      account_id: string;
      has_secret: string;
      account_label: string;
      scanned_from: number;
    }
  }

  export type ListAddressGroupings = [ string, number, string?, ][][];

  export interface SendTypeTo {
    fee?: number;
    bytes: number;
    need_hwdevice: boolean;
    error?: boolean;
  }


  export interface SmsgScanBuckets {
    result: string;
  }

}
