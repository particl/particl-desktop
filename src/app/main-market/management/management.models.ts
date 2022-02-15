import { IMAGE_PROTOCOL, MarketType, MARKET_REGION } from '../shared/market.models';


export enum GovernanceActions {
  FLAG = 1,
  VOTE_KEEP = 2,
  VOTE_REMOVE = 3
}


export interface AvailableMarket {
  id: number;
  name: string;
  image: string;
  region: {
    label: string;
    value: MARKET_REGION;
  };
  summary: string;
  receiveKey: string;
  publishKey: string;
  marketType: MarketType;
  expires: number;
  isDefaultMarket: boolean;
}


export interface JoinedMarket {
  id: number;
  name: string;
  summary: string;
  image: string;
  region: {
    label: string;
    value: MARKET_REGION;
  };
  marketType: MarketType;
  receiveKey: string;
  publishKey: string;
  receiveAddress: string;
  publishAddress: string;
  isFlagged: boolean;
}


export interface CreateMarketRequest {
  name: string;
  marketType: MarketType;
  description?: string;
  region?: MARKET_REGION;
  image?: {
    type: IMAGE_PROTOCOL;
    data: string;
  };
  receiveKey?: string;
  publishKey?: string;
}


export interface MarketGovernanceInfo {
  marketId: number;
  proposalHash: string;
  voteKeepId: number | null;
  voteRemoveId: number | null;
  voteCastId: number | null;
}
