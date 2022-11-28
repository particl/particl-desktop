import { Market } from '../services/data/data.models';

export enum StartedStatus {
  PENDING,
  STARTED,
  FAILED,
  STOPPED
}


export interface Profile {
  id: number;
  name: string;
  hasMnemonicSaved: boolean;
  walletPath: string;
}


export interface Identity {
  id: number;
  name: string;
  displayName: string;
  path: string;
  address: string;
  icon: string;
  carts: CartDetail[];
  markets: Market[];
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
  usePaidMsgForImages: boolean;
  startupWaitTimeoutSeconds: number;
  defaultListingCommentPageCount: number;
  daysToNotifyListingExpired: number;
  marketsLastAdded: number;
  txUrl: string;
}


export interface DefaultMarketConfig {
  url: string;
  port: number;
  imagePath: string;
  imageMaxSizeFree: number;
  imageMaxSizePaid: number;
}


export interface ChatNotifications {
  orders: string[];
  listings: string[];
}


export interface MarketNotifications {
  identityCartItemCount: number;
  buyOrdersPendingAction: string[];
  sellOrdersPendingAction: string[];
  chatsUnread: ChatNotifications;
}


export interface MarketStateModel {
  started: StartedStatus;
  profile: Profile;                       //  active profile
  identities: Identity[];                 //  list of identities belonging to the current profile
  identity: number;                       //  active identity
  defaultConfig: DefaultMarketConfig;
  settings: MarketSettings;
  notifications: MarketNotifications;
  lastSmsgScanIssued: number;
}


export namespace IPCResponses {
  export interface getSettings {
    network?: {
      port: number;
      timeout: number;
    };
    urls?: {
      transaction: string;
    }
  }
}
