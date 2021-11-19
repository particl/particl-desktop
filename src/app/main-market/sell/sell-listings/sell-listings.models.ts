
export interface SellListing {
  idMarketTemplate: number;
  idBaseTemplate: number;
  listingId: number;
  title: string;
  summary: string;
  image: string;
  marketKey: string;
  categoryName: string;
  status: '' | 'EXPIRED' | 'ACTIVE';
  created: number;
  updated: number;
  expires: number;
  shippingSource: string;
  priceBase: string;
  priceShippingLocal: string;
  priceShippingIntl: string;
  escrowBuyerRatio: number;
  escrowSellerRatio: number;
}
