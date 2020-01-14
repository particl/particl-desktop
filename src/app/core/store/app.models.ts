import { NumberValueAccessor } from '@angular/forms';

export enum APP_MODE {
  WALLET,
  MARKET
};


export interface AppStateModel {
  isConnected: boolean;
  loadingMessage: string;
  appMode: APP_MODE;
}


export interface CoreConnectionModel {
  testnet: boolean;
  auth: string;
  rpcbind: string;
  port: number;
  proxy: string;
  upnp: boolean;
}


export interface AppSettingsModel {
  activatedWallet: string;
  language: string;
  marketActive: boolean;
}


export interface ConnectionDetails {
  connected: boolean,
  rpcHostname: string,
  rpcPort: number,
  rpcAuth: string
}


export interface SettingsViewModel {
  proxy: string;
  upnp: boolean;
  language: string;
  marketActive: boolean;
}



export interface PeerModel {
  id: number;
  addr: string;
  addrbind: string;
  services: string;
  services_str: string;
  version: number;
  subver: string;
  whitelisted: boolean;
  minfeefilter: number;
  synced_blocks: number;
  synced_headers: number;
  inbound: boolean;
  addnode: boolean;
  banscore: number;
  timeoffset: number;
  currentheight: number;
}


export interface AppDataModel {
  peers: PeerModel[]
}
