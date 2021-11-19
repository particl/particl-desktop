import { PartoshiAmount } from 'app/core/util/utils';


export interface CartItem {
  id: number;
  listingId: number;
  title: string;
  image: string;
  category: string;
  marketName: string;
  shippingLocations: string[];
  sourceLocation: string;
  escrow: {
    buyerRatio: number;
    sellerRatio: number;
    isRecommendedDefault: boolean;
  }
  expiryTime: number;
  price: {
    base: PartoshiAmount;
    shippingLocal: PartoshiAmount;
    shippingIntl: PartoshiAmount;
  };
}


export interface CartTotals {
  itemBase: PartoshiAmount;
  shippingOnly: PartoshiAmount;
  cartTotal: PartoshiAmount;
  escrowValue: PartoshiAmount;
  orderTotal: PartoshiAmount;
}
