import { PartoshiAmount } from 'app/core/util/utils';


export interface OrderCounts {
  sellWaiting: number;
  sellActive: number;
  buyWaiting: number;
  buyActive: number;
  fundsInEscrow: PartoshiAmount;
}

export interface MarketCounts {
  joinedMarkets: number;
}

export interface ListingCounts {
  expiredListings: number;
}


export interface AllCounts {
  orders?: OrderCounts;
  markets?: MarketCounts;
  listings?: ListingCounts;
}
