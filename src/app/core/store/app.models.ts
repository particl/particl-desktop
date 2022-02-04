import { NumberValueAccessor } from '@angular/forms';

export enum APP_MODE {
  WALLET,
  MARKET
}


export interface AppStateModel {
  isConnected: boolean;
  loadingMessage: string;
  appMode: APP_MODE;
}


export interface CoreConnectionModel {
  testnet: boolean;
  regtest: boolean;
  auth: string;
  rpcbind: string;
  port: number;
  proxy: string;
  upnp: boolean;
}


export interface AppSettingsStateModel {
  activatedWallet: string;
  language: string;
  zmqPort: number;
}


export interface ConnectionDetails {
  connected: boolean;
  rpcHostname: string;
  rpcPort: number;
  rpcAuth: string;
}


export interface SettingsViewModel {
  proxy: string;
  upnp: boolean;
  language: string;
}


export interface NetworkInfoModel {
  connections: number;
  timeoffset: number;
  subversion: string;
}


export interface AppVersionsModel {
  latestClient: string;
}


export interface RpcPeerInfoModel {
  id: number;
  addr: string;
  addrbind: string;
  addrlocal: string;
  network: 'ipv4' | 'ipv6';
  services: string;
  servicesnames: Array<'NETWORK' | 'WITNESS' | 'SMSG' | 'NETWORK_LIMITED'>;
  relaytxes: boolean;
  lastsend: number;
  lastrecv: number;
  last_transaction: number;
  last_block: number;
  bytessent: number;
  bytesrecv: number;
  conntime: number;
  timeoffset: number;
  pingtime: number;
  minping: number;
  version: number;
  subver: string;
  inbound: string;
  startingheight: number;
  currentheight: number;
  banscore: number;
  synced_headers: number;
  synced_blocks: number;
  duplicate_count: number;
  loose_headers: number;
  inflight: Array<any>;
  addr_processed: number;
  addr_rate_limited: number;
  permissions: Array<any>;
  minfeefilter: number;
  bytessent_per_msg: {
    addr: number;
    feefilter: number;
    getaddr: number;
    getheaders: number;
    ping: number;
    pong: number;
    sendcmpct: number;
    sendheaders: number;
    smsgPing: number;
    verack: number;
    version: number;
  };
  bytesrecv_per_msg: {
    addr: number;
    feefilter: number;
    ping: number;
    pong: number;
    sendcmpct: number;
    sendheaders: number;
    verack: number;
    version: number;
  };
  connection_type: string;
}


export interface PeerInfo {
  address: string;
  blockHeight: number;
}



export interface AppDataStateModel {
  networkInfo: NetworkInfoModel;
  appVersions: AppVersionsModel;
  peers: PeerInfo[];
  currentBlockHeight: number;
}



export interface ZmqFieldStatus {
  connected: boolean;
  retryCount: number;
  error: boolean;
}


export interface ZmqTypeField {
  status: ZmqFieldStatus;
  data: any;
}


export enum ZmqActions {
  CONNECTED = 'connected',
  CLOSED = 'close',
  RETRY = 'retry',
  ERROR = 'error',
  DATA = 'data'
}


export interface ZmqConnectionStateModel {
  hashblock: ZmqTypeField;
  smsg: ZmqTypeField;
  hashtx: ZmqTypeField;
}
