
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


export interface ProfileResp {
  id: number;
  name: string;
  address: string;
}


export interface Identity {
  id: number;
  name: string;
  displayName: string;
  path: string;
  icon: string;
}


export interface MarketSettings {
  port: number;
  defaultProfileID: number;
  defaultIdentityID: number;
  userRegion: string;
}


export interface IdentityResp {
  address: string;
  hdseedid: string;
  id: number;
  mnemonic: string | null;
  passphrase: string | null;
  path: string;
  profileId: number;
  type: 'MARKET' | 'PROFILE';
  wallet: string;
}


export interface MarketStateModel {
  started: StartedStatus;
  profile: Profile;
  identities: Identity[];
  identity: Identity;
  settings: MarketSettings;
}
