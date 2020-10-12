
export enum StartedStatus {
  PENDING,
  STARTED,
  FAILED,
  STOPPED
}


export interface Profile {
  id: number;
  name: string;
}


export interface Identity {
  id: number;
  name: string;
  displayName: string;
  path: string;
  address: string;
  icon: string;
  carts: CartDetail[];
}


export interface CartDetail {
  id: number;
  name: string;
}


export interface MarketSettings {
  port: number;
  defaultProfileID: number;
  defaultIdentityID: number;
  userRegion: string;
  canModifyIdentities: boolean;
  useAnonBalanceForFees: boolean;
}


export interface DefaultMarketConfig {
  url: string;
  imagePath: string;
}


export interface MarketStateModel {
  started: StartedStatus;
  profile: Profile;
  identities: Identity[];
  identity: Identity;
  defaultConfig: DefaultMarketConfig;
  settings: MarketSettings;
}
