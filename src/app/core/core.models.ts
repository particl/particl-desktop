export interface CoreErrorModel {
  code: number;
  message: string;
  error?: string;
}


export interface RpcGetBlockchainInfo {
  bestblockhash: string;
  blockindexsize: number;
  blocks: number;
  chain: 'test' | 'main';
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


export interface RpcGetPeerInfo {
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
}