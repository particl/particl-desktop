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
}


export interface DefaultMarketConfig {
  url: string;
  imagePath: string;
  imageMaxSizeFree: number;
  imageMaxSizePaid: number;
}


export interface MarketStateModel {
  started: StartedStatus;
  profile: Profile;
  identities: Identity[];
  identity: Identity;
  defaultConfig: DefaultMarketConfig;
  settings: MarketSettings;
}


export interface ListingsCommentsState {
  title: string;
  imageId: number;
  readLast: number;
  count: number;
}


export interface OrdersNotificationState {
  readLast: number;
  buyCount: number;
  sellCount: number;
}


export interface NotificationsStateModel {
  orders: { [marketKey: string]: OrdersNotificationState };
  comments:  {
    [marketKey: string]: {
      buy: {
        [listingHash: string]: ListingsCommentsState
      };
      sell: {
        [listingHash: string]: ListingsCommentsState
      };
    };
  };
}
