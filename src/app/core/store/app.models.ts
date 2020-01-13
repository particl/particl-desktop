
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
