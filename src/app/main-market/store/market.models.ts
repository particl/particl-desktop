
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
  name: string;
  displayName: string;
  path: string;
  icon: string;
}


export interface MarketStateModel {
  started: StartedStatus;
  profile: Profile;
  identities: Identity[];
  identity: Identity;
}
