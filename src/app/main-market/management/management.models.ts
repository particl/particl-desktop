import { IMAGE_PROTOCOL, MarketType, MARKET_REGION } from '../shared/market.models';

export interface AvailableMarket {
  id: number;
  name: string;
  image: string;
  region: {
    label: string;
    value: string;
  };
  summary: string;
  receiveKey: string;
  publishKey: string | null;
}


export interface JoinedMarket {
  id: number;
  name: string;
  summary: string;
  image: string;
  region: {
    label: string;
    value: string;
  };
  marketType: MarketType;
  receiveKey: string;
  publishKey: string | null;
  publishAddress: string;  // For storefront related usage
  governance?: {
    proposalHash: string;
    voteCast: number;
    voteOptionKeep: number;
    voteOptionRemove: number;
  };
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
