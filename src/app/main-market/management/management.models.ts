import { IMAGE_PROTOCOL, MarketType, MARKET_REGION } from '../shared/market.models';

export interface AvailableMarket {
  id: number;
  name: string;
  image: string;
  region: string;
  summary: string;
  receiveKey: string;
  publishKey: string | null;
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
