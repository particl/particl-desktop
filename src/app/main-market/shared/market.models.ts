
export type MarketType = 'MARKETPLACE' | 'STOREFRONT' | 'STOREFRONT_ADMIN';


export interface RespCategoryList {
  id: number;
  key: string;
  name: string;
  market: string;
  description: string;
  parentItemCategoryId: number | null;
  updatedAt: number;
  createdAt: number;
  ChildItemCategories?: RespCategoryList[];
}


export interface RespMarketListMarketItem {
  id: number;
  name: string;
  type: MarketType;
  receiveKey: string;
  receiveAddress: string;
  publishKey: string;
  publishAddress: string;
  updatedAt: number;
  createdAt: number;
  profileId: number;
  identityId: number;
  removed: 0 | 1;
}
